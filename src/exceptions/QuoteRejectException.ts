import BaseException from './BaseException';

class QuoteRejectException extends BaseException {
  constructor(message: string = 'Oferta rejeitada', debug: any = {}) {
    super(405, message, {}, debug);
  }
}

export default QuoteRejectException;
