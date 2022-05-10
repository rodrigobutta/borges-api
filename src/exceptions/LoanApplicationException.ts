import BaseException from './BaseException';

class LoanApplicationException extends BaseException {
  constructor(message: string = 'Erro na proposta') {
    super(404, message);
  }
}

export default LoanApplicationException;
