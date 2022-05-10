import BaseException from './BaseException';

class InventoryNotPublished extends BaseException {
  constructor(message: string = 'O veículo não está mais disponível.') {
    super(404, message);
  }
}

export default InventoryNotPublished;
