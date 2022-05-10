import BaseException from './BaseException';

class AccountFileNotFoundException extends BaseException {
  constructor(message: string = 'Arquivo de conta não encontrado') {
    super(404, message);
  }
}

export default AccountFileNotFoundException;
