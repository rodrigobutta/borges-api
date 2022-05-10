import BaseException from './BaseException';

class UserAlreadyExistsException extends BaseException {
  constructor(message: string = 'Usuario já existe') {
    super(441, message);
  }
}

export default UserAlreadyExistsException;
