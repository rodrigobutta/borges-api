import HttpException from './HttpException';

class AuthUserException extends HttpException {
  constructor() {
    super(401, 'O usuário da autenticação não pôde ser recuperado');
  }
}

export default AuthUserException;
