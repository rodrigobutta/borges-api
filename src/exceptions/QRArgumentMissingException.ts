import BaseException from './BaseException';

class QRArgumentMissingException extends BaseException {
  constructor(message: string = 'Faltan dados pelo QR') {
    super(400, message);
  }
}

export default QRArgumentMissingException;
