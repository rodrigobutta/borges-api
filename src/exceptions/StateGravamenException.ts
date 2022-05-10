import BaseException from './BaseException';

class StateGravamenException extends BaseException {
  constructor(message: string = 'Erro em Gravames') {
    super(500, message);
  }
}

export default StateGravamenException;
