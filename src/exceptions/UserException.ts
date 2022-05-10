import BaseException from './BaseException';

class UserException extends BaseException {
  constructor(message: string = 'Erro em usuario') {
    super(500, message);
  }
}

export default UserException;
