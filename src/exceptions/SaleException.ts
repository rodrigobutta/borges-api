import BaseException from './BaseException';

class SaleException extends BaseException {
  constructor(message: string = 'Erro na Venda') {
    super(500, message);
  }
}

export default SaleException;
