import BaseException from './BaseException';

class SaleArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetro inválido para venda') {
    super(400, message);
  }
}

export default SaleArgumentMissingException;
