import BaseException from './BaseException';

class InventoryCommentException extends BaseException {
  constructor(message: string = 'Erro no comentario de estoque') {
    super(500, message);
  }
}

export default InventoryCommentException;
