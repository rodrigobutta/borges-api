import BaseException from './BaseException';

class AuthPairNeedsCustomerInfoException extends BaseException {
  constructor(message: string = 'Este usuário já foi emparelhado com um cliente') {
    super(440, message);
  }
}

export default AuthPairNeedsCustomerInfoException;
