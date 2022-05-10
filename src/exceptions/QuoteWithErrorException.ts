import BaseException from './BaseException';

class QuoteWithErrorException extends BaseException {
  constructor(message: string = 'Erros em Oferta', debug: any = {}) {
    super(406, message, {}, debug);
  }
}

export default QuoteWithErrorException;
