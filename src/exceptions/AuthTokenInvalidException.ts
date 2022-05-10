import HttpException from './HttpException';

class AuthTokenInvalidException extends HttpException {
  constructor(message: string = 'A autenticação com o token é inválida') {
    super(401, message);
  }
}

export default AuthTokenInvalidException;
