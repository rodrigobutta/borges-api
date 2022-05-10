import { ErrorRequestHandler } from 'express';
import BaseException from './BaseException';

class QuoteStatusNotFoundException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(404, 'Não foi encontrada uma instância de oferta', { error: error });
  }
}

export default QuoteStatusNotFoundException;
