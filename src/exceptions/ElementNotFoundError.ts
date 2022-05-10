import BaseException from './BaseException';

class ElementNotFoundError extends BaseException {
  constructor(message: string = 'Elemento não encontrado') {
    super(404, message);
  }
}

export default ElementNotFoundError;
