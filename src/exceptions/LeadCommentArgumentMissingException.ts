import BaseException from './BaseException';

class LeadCommentArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de comentário de cliente inválidos') {
    super(400, message);
  }
}

export default LeadCommentArgumentMissingException;
