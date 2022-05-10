import BaseException from './BaseException';

class CurrencyException extends BaseException {
  constructor(message: string = 'Erro na conversão de moedas') {
    super(500, message);
  }
}

export default CurrencyException;
