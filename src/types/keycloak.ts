import * as jwt from 'jsonwebtoken';
export interface KeycloakJWT extends jwt.JwtPayload {
  email_verified?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  locale?: string;
  family_name?: string;
  email?: string;

  profile?: string | undefined;
  client?: string | undefined;
}

export enum KeycloakClient {
  Web = 'borges-web-client',
  Api = 'borges-api-client',
  App = 'borges-app-client',
}
