import BaseException from './BaseException';

class InventoryArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetro de estoque inválido') {
    super(400, message);
  }
}

export default InventoryArgumentMissingException;
