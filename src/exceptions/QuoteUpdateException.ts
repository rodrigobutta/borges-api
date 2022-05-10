import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class QuoteUpdateException extends BaseException {
  constructor(error?: ErrorRequestHandler | any) {
    super(500, 'Erro actualizando Oferta', { error: error });
  }
}

export default QuoteUpdateException;
