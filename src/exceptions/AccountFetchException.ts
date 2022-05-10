import BaseException from './BaseException';

class AccountFetchException extends BaseException {
  constructor(message: string = 'Erro na recuperação da conta') {
    super(500, message);
  }
}

export default AccountFetchException;
