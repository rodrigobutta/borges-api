import BaseException from './BaseException';

class LocationException extends BaseException {
  constructor(message: string = 'Erro na localização') {
    super(500, message);
  }
}

export default LocationException;
