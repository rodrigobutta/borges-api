import BaseException from './BaseException';

class ColorDeleteException extends BaseException {
  constructor(message: string = 'Não foi possível eliminar a cor') {
    super(404, message);
  }
}

export default ColorDeleteException;
