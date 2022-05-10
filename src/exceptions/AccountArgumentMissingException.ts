import BaseException from './BaseException';

class AccountArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de conta inválidos') {
    super(400, message);
  }
}

export default AccountArgumentMissingException;
