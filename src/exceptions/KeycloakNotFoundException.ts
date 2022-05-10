import BaseException from './BaseException';

class KeycloakNotFoundException extends BaseException {
  constructor(message: string = 'Keycloak element not found') {
    super(404, message);
  }
}

export default KeycloakNotFoundException;
