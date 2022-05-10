import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class RevisionLoanApplicationNotFoundException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(404, 'Oferta não encontrada', { error: error });
  }
}

export default RevisionLoanApplicationNotFoundException;
