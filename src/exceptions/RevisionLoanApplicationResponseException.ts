import BaseException from './BaseException';

class RevisionLoanApplicationResponseException extends BaseException {
  constructor(message: string = 'Erro na resposta') {
    super(500, message);
  }
}

export default RevisionLoanApplicationResponseException;
