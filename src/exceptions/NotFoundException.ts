import BaseException from './BaseException';

class NotFoundException extends BaseException {
  constructor(message: string = 'Erro na recuperação do item') {
    super(404, message);
  }
}

export default NotFoundException;
