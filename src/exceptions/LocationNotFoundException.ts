import BaseException from './BaseException';

class LocationNotFoundException extends BaseException {
  constructor(message: string = 'Location not found') {
    super(404, message);
  }
}

export default LocationNotFoundException;
