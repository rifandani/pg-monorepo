import { randomUUID } from 'node:crypto';
import type {
  AccessToken,
  AccountClaims,
  AuthorizationCode,
  BackchannelAuthenticationRequest,
  DeviceCode,
  Account as IAccount,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';

const store = new Map<string, Account>();
const logins = new Map<string, Account>();

export class Account implements IAccount {
  accountId: string;
  [key: string]: unknown;
  // biome-ignore lint/suspicious/noExplicitAny: idk
  profile: any;

  // biome-ignore lint/suspicious/noExplicitAny: idk
  constructor(id: string, profile?: any) {
    this.accountId = id || randomUUID();
    this.profile = profile;
    store.set(this.accountId, this);
  }

  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  claims(
    // use: string,
    // scope: string,
    // claims: { [key: string]: null | ClaimsParameterMember },
    // rejected: string[]
  ): AccountClaims {
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name,
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim

      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000',
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1_454_704_946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin',
    };
  }

  static findByFederated(provider: Provider, claims: AccountClaims) {
    const id = `${provider}.${claims.sub}`;
    if (!logins.get(id)) {
      logins.set(id, new Account(id, claims));
    }
    return logins.get(id);
  }

  static findByLogin(login: string) {
    if (!logins.get(login)) {
      logins.set(login, new Account(login));
    }

    return logins.get(login);
  }

  static findAccount(
    _ctx: KoaContextWithOIDC,
    id: string,
    _token:
      | AuthorizationCode
      | AccessToken
      | DeviceCode
      | BackchannelAuthenticationRequest
  ): Account | undefined {
    // token is a reference to the token used for which a given account is being loaded,
    //   it is undefined in scenarios where account claims are returned from authorization endpoint
    if (!store.get(id)) {
      new Account(id);
    }

    return store.get(id);
  }
}
