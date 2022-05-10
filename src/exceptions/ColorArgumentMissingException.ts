import BaseException from './BaseException';

class ColorArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de cor inválidos') {
    super(400, message);
  }
}

export default ColorArgumentMissingException;
