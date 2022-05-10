import BaseException from './BaseException';

class ColorFetchException extends BaseException {
  constructor(message: string = 'Erro recuperando cor') {
    super(500, message);
  }
}

export default ColorFetchException;
