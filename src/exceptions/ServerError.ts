import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class ServerError extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(500, 'Erro do servidor', { error: error });
  }
}

export default ServerError;
