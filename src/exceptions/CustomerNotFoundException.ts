import BaseException from './BaseException';

class CustomerNotFoundException extends BaseException {
  constructor(message: string = 'Cliente não encontrado') {
    super(404, message);
  }
}

export default CustomerNotFoundException;
