import BaseException from './BaseException';

class RevisionLoanApplicationFetchException extends BaseException {
  constructor(message: string = 'Erro recuperando Proposta') {
    super(500, message);
  }
}

export default RevisionLoanApplicationFetchException;
