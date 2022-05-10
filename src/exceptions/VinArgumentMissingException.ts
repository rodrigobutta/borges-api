import BaseException from './BaseException';

class VinArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de Chassi inválidos') {
    super(400, message);
  }
}

export default VinArgumentMissingException;
