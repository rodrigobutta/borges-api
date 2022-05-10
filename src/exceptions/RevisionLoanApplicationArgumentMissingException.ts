import BaseException from './BaseException';

class RevisionLoanApplicationArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetro de Conta inválido') {
    super(400, message);
  }
}

export default RevisionLoanApplicationArgumentMissingException;
