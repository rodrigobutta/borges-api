import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class LoanApplicationUpdateException extends BaseException {
  constructor(error?: ErrorRequestHandler | any) {
    super(500, 'Erro actualizando Proposta', { error: error });
  }
}

export default LoanApplicationUpdateException;
