import BaseException from './BaseException';

class LocationArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetro de localização inválido') {
    super(400, message);
  }
}

export default LocationArgumentMissingException;
