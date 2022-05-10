import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class ColorUpdateException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(500, 'Erro atualizando cor', { error: error });
  }
}

export default ColorUpdateException;
