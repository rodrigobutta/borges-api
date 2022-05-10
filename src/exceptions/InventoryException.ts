import BaseException from './BaseException';

class InventoryException extends BaseException {
  constructor(message: string = 'Erro na Estoque') {
    super(500, message);
  }
}

export default InventoryException;
