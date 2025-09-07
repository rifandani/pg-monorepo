import path from 'node:path';
import url from 'node:url';
import { dirname } from 'desm';
import express from 'express';
import { Provider } from 'oidc-provider';
import { oidcConfig } from '@/auth/constants/config.js';
import { helmetMiddleware } from '@/core/middlewares/helmet.js';
import { loggerMiddleware } from '@/core/middlewares/logger.js';
import { routes } from '@/routes.js';

const {
  PORT = 3334,
  ISSUER = `http://localhost:${PORT}`,
  NODE_ENV,
} = process.env;
const isProd = NODE_ENV === 'production';
const app = express();

app.use(loggerMiddleware); // enable this if we want verbose logs
app.use(helmetMiddleware);
// app.use(express.json());
// app.use(
//   cors({
//     exposedHeaders: ['Mcp-Session-Id'], // for stateful implementation
//     origin: '*', // allow all client origins, like Cursor, MCP inspector, etc...
//   })
// );

const __dirname = dirname(import.meta.url);
app.set('views', path.join(__dirname, 'auth/views'));
app.set('view engine', 'ejs');

const provider = new Provider(ISSUER, oidcConfig);

if (isProd) {
  app.enable('trust proxy');
  provider.proxy = true;

  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      res.redirect(
        url.format({
          protocol: 'https',
          host: req.get('host'),
          pathname: req.originalUrl,
        })
      );
    } else {
      res.status(400).json({
        error: 'invalid_request',
        error_description: 'do yourself a favor and only use https',
      });
    }
  });
}

routes(app, provider);

app.use(provider.callback());

app.listen(PORT, (error) => {
  if (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }

  console.log(
    `Express running on http://localhost:${PORT} (check /.well-known/openid-configuration)`
  );
});

// handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});
