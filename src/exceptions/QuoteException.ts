import BaseException from './BaseException';

class QuoteException extends BaseException {
  constructor(error?: any) {
    super(500, 'Erro em oferta', { error: error });
  }
}

export default QuoteException;
