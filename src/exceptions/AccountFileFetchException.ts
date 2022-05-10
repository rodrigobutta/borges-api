import BaseException from './BaseException';

class AccountFileFetchException extends BaseException {
  constructor(message: string = 'Erro na recuperação do arquivos da conta') {
    super(500, message);
  }
}

export default AccountFileFetchException;
