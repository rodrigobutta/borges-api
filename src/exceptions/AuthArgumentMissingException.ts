import BaseException from './BaseException';

class AuthArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de usuário inválidos no auth') {
    super(400, message);
  }
}

export default AuthArgumentMissingException;
