import BaseException from './BaseException';

class CustomerEmailNotFoundException extends BaseException {
  constructor(message: string = 'Email do cliente não encontrado') {
    super(404, message);
  }
}

export default CustomerEmailNotFoundException;
