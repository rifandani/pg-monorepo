/** biome-ignore-all lint/suspicious/noExplicitAny: it's fine */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: it's fine */
import { strict as assert } from 'node:assert/strict';
import * as querystring from 'node:querystring';
import { inspect } from 'node:util';
import express from 'express';
import type Provider from 'oidc-provider';
import { errors, type Grant, type InteractionResults } from 'oidc-provider';
import { isEmpty } from 'radashi';
import { Account } from '@/auth/constants/account.js';

const urlencodedMiddleware = express.urlencoded({ extended: false });

function setNoCacheMiddleware(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.set('cache-control', 'no-store');
  next();
}

const keys = new Set();
const debug = (obj: Record<string, any>) =>
  querystring.stringify(
    Object.entries(obj).reduce(
      (acc, [key, value]) => {
        keys.add(key);
        if (isEmpty(value)) {
          return acc;
        }
        acc[key] = inspect(value, { depth: null });
        return acc;
      },
      {} as Record<string, any>
    ),
    '<br/>',
    ': ',
    {
      encodeURIComponent(value) {
        return keys.has(value) ? `<strong>${value}</strong>` : value;
      },
    }
  );
const { SessionNotFound } = errors;

export const routes = (app: express.Application, provider: Provider) => {
  // render engine middleware
  app.use((_req, res, next) => {
    const orig = res.render;
    // you'll probably want to use a full blown render engine capable of layouts
    res.render = (view, locals) => {
      app.render(view, locals, (err, html) => {
        if (err) {
          throw err;
        }

        orig.call(res, '_layout', {
          ...locals,
          // @ts-expect-error it's fine
          body: html,
        });
      });
    };
    next();
  });

  app.get('/interaction/:uid', setNoCacheMiddleware, async (req, res, next) => {
    try {
      const { uid, prompt, params, session } =
        await provider.interactionDetails(req, res);

      const client = await provider.Client.find(params.client_id as string);

      switch (prompt.name) {
        case 'login': {
          return res.render('login', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Sign-in',
            session: session ? debug(session) : undefined,
            dbg: {
              params: debug(params),
              prompt: debug(prompt),
            },
          });
        }
        case 'consent': {
          return res.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
            session: session ? debug(session) : undefined,
            dbg: {
              params: debug(params),
              prompt: debug(prompt),
            },
          });
        }
        default:
          return;
      }
    } catch (err) {
      return next(err);
    }
  });

  app.post(
    '/interaction/:uid/login',
    setNoCacheMiddleware,
    urlencodedMiddleware,
    async (req, res, next) => {
      try {
        const {
          prompt: { name },
        } = await provider.interactionDetails(req, res);
        assert.equal(name, 'login');
        const account = await Account.findByLogin(req.body.login);

        const result = {
          login: {
            accountId: account?.accountId ?? '',
          },
        };

        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/interaction/:uid/confirm',
    setNoCacheMiddleware,
    urlencodedMiddleware,
    async (req, res, next) => {
      try {
        const interactionDetails = await provider.interactionDetails(req, res);
        const {
          prompt: { name, details },
          params,
          session,
        } = interactionDetails;
        assert.equal(name, 'consent');

        let { grantId } = interactionDetails;
        let grant: Grant | undefined;

        if (grantId) {
          // we'll be modifying existing grant in existing session
          grant = await provider.Grant.find(grantId);
        } else {
          // we're establishing a new grant
          grant = new provider.Grant({
            accountId: session?.accountId ?? '',
            clientId: params.client_id as string,
          });
        }

        if (details.missingOIDCScope) {
          grant?.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
        }
        if (details.missingOIDCClaims) {
          grant?.addOIDCClaims(details.missingOIDCClaims as string[]);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes
          )) {
            grant?.addResourceScope(indicator, scopes.join(' '));
          }
        }

        grantId = await grant?.save();

        const consent: InteractionResults = {};
        if (!interactionDetails.grantId) {
          // we don't have to pass grantId to consent, we're just modifying existing one
          consent.grantId = grantId;
        }

        const result = { consent };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: true,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.get(
    '/interaction/:uid/abort',
    setNoCacheMiddleware,
    async (req, res, next) => {
      try {
        const result = {
          error: 'access_denied',
          error_description: 'End-User aborted interaction',
        };
        await provider.interactionFinished(req, res, result, {
          mergeWithLastSubmission: false,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.use(
    (
      err: Error,
      _req: express.Request,
      _res: express.Response,
      next: express.NextFunction
    ) => {
      if (err instanceof SessionNotFound) {
        // handle interaction expired / session not found error
        console.error(`🐧 ~ "routes.ts" at line 217: err -> `, err);
      }
      next(err);
    }
  );
};
