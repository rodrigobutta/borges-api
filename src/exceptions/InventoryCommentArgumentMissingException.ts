import BaseException from './BaseException';

class InventoryCommentArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de comentário inválidos') {
    super(400, message);
  }
}

export default InventoryCommentArgumentMissingException;
