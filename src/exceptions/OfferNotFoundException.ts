import BaseException from './BaseException';

class OfferNotFoundException extends BaseException {
  constructor(message: string = 'Oferta não encontrada') {
    super(404, message);
  }
}

export default OfferNotFoundException;
