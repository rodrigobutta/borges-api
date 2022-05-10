import BaseException from './BaseException';

class SignDocumentArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros inválidos para assinatura de documento') {
    super(400, message);
  }
}

export default SignDocumentArgumentMissingException;
