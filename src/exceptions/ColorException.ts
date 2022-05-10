import BaseException from './BaseException';

class ColorException extends BaseException {
  constructor(message: string = 'Cor erro') {
    super(500, message);
  }
}

export default ColorException;
