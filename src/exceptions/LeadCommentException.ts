import BaseException from './BaseException';

class LeadCommentException extends BaseException {
  constructor(message: string = 'Erro em comentàrio de cliente') {
    super(500, message);
  }
}

export default LeadCommentException;
