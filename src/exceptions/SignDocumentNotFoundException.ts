import BaseException from './BaseException';

class SignDocumentNotFoundException extends BaseException {
  constructor(message: string = 'Assinatura de documento não encontrada') {
    super(404, message);
  }
}

export default SignDocumentNotFoundException;
