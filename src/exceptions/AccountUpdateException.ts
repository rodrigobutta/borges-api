import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class AccountUpdateException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(500, 'Erro na atualização da conta', { error: error });
  }
}

export default AccountUpdateException;
