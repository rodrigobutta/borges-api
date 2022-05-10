import BaseException from './BaseException';

class SaleNotFoundException extends BaseException {
  constructor(message: string = 'Venda não encontrada') {
    super(404, message);
  }
}

export default SaleNotFoundException;
