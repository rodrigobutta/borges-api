import BaseException from './BaseException';

class VinException extends BaseException {
  constructor(message: string = 'Erro no Chassi') {
    super(500, message);
  }
}

export default VinException;
