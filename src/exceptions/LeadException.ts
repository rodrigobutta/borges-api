import BaseException from './BaseException';

class LeadException extends BaseException {
  constructor(message: string = 'Erro em cliente') {
    super(500, message);
  }
}

export default LeadException;
