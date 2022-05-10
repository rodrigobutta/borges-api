import BaseException from './BaseException';

class LeadNotFoundException extends BaseException {
  constructor(message: string = 'Cliente não encontrado') {
    super(404, message);
  }
}

export default LeadNotFoundException;
