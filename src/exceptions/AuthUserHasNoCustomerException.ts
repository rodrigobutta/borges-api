import BaseException from './BaseException';

class AuthUserHasNoCustomerException extends BaseException {
  constructor(message: string = 'O número de cidadão é necessário para mapear ou criar o cliente para o usuário') {
    super(202, message);
  }
}

export default AuthUserHasNoCustomerException;
