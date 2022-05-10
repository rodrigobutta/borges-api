import BaseException from './BaseException';

class AlreadyExistsException extends BaseException {
  constructor(message: string = 'Already exists') {
    super(402, message);
  }
}

export default AlreadyExistsException;
