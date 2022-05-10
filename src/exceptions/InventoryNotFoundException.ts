import BaseException from './BaseException';

class InventoryNotFoundException extends BaseException {
  constructor(message: string = 'Estoque não encontrado') {
    super(404, message);
  }
}

export default InventoryNotFoundException;
