import BaseException from './BaseException';

class CustomerAnalysisNotFoundException extends BaseException {
  constructor(message: string = 'Análise do cliente não encontrada') {
    super(404, message);
  }
}

export default CustomerAnalysisNotFoundException;
