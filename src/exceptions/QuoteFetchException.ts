import BaseException from './BaseException';

class QuoteFetchException extends BaseException {
  constructor(message: string = 'Erro recuperando quotes') {
    super(500, message);
  }
}

export default QuoteFetchException;
