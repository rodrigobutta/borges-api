import BaseException from './BaseException';

class ForbiddenException extends BaseException {
  constructor(message: string = 'El usuario no puede realizar esta acción') {
    super(403, message);
  }
}

export default ForbiddenException;
