import { Request } from 'express';
import { KeycloakJWT } from '../types/keycloak';

export interface RequestWithAuthInterface extends Request {
  auth: KeycloakJWT | undefined;
}

interface ResourceAccess {
  roles: string[];
}

export interface AuthInterface {
  resource_access: {
    [key: string]: ResourceAccess;
  };
  [x: string]: any;
}
