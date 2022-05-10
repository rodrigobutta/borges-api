import BaseException from './BaseException';

class AuthPairArgumentMissingException extends BaseException {
  constructor(
    message: string = 'Número de CPF e tipo de emprego são necessários para emparelhar um usuário a um cliente',
  ) {
    super(404, message);
  }
}

export default AuthPairArgumentMissingException;
