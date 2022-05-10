import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class CustomerUpdateException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(500, 'Erro ao atualizar o cliente', { error: error });
  }
}

export default CustomerUpdateException;
