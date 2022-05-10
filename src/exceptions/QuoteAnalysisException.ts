import BaseException from './BaseException';

class QuoteAnalysisException extends BaseException {
  constructor(message: string = 'Erro em analize da oferta') {
    super(500, message);
  }
}

export default QuoteAnalysisException;
