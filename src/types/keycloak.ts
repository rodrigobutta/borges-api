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

export enum KeycloakGroup {
  Panel = 'panel',
  Dealer = 'dealer',
  Consumer = 'consumer',
}
