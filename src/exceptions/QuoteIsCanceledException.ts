import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class QuoteIsCanceledException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(404, 'La cotización fue cancelada', { error: error });
  }
}

export default QuoteIsCanceledException;
