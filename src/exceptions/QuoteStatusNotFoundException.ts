import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class QuoteStatusNotFoundException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(404, 'Situação da Oferta não encontrada', { error: error });
  }
}

export default QuoteStatusNotFoundException;
