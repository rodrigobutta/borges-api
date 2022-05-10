import BaseException from './BaseException';

class KeycloakValidationException extends BaseException {
  constructor(message: string = 'Algumas validações falharam em Keycloak', code: number = 400) {
    super(code, message);
  }
}

export default KeycloakValidationException;
