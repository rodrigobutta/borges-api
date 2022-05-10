import BaseException from './BaseException';

class KeycloakException extends BaseException {
  constructor(message: string = 'Erro com keycloak') {
    super(500, message);
  }
}

export default KeycloakException;
