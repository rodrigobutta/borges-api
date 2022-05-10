import BaseException from './BaseException';

class DocumentSignatureNotFoundException extends BaseException {
  constructor(message: string = 'Não foi encontrada a assinatura SCR do Requester') {
    super(404, message);
  }
}

export default DocumentSignatureNotFoundException;
