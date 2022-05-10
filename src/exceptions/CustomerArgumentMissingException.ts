import BaseException from './BaseException';

class CustomerArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros inválidos do cliente') {
    super(400, message);
  }
}

export default CustomerArgumentMissingException;
