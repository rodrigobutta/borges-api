import HttpException from './HttpException';

class AuthTokenMissingException extends HttpException {
  constructor() {
    super(401, 'Falta o token de autenticação');
  }
}

export default AuthTokenMissingException;
