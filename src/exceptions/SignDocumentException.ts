import BaseException from './BaseException';

class SignDocumentException extends BaseException {
  constructor(message: string = 'Erro en Assinatura de documento') {
    super(500, message);
  }
}

export default SignDocumentException;
