import BaseException from './BaseException';

class LoanApplicationArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetro da conta inválido') {
    super(400, message);
  }
}

export default LoanApplicationArgumentMissingException;
