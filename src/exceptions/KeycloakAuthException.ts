import BaseException from './BaseException';

class KeycloakAuthException extends BaseException {
  constructor(message: string = 'Erro ao tentar autenticar com keycloak') {
    super(500, message);
  }
}

export default KeycloakAuthException;
