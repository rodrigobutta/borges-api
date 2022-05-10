import BaseException from './BaseException';

class RevisionLoanApplicationException extends BaseException {
  constructor(message: string = 'Erro na revisão') {
    super(500, message);
  }
}

export default RevisionLoanApplicationException;
