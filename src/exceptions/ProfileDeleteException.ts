import BaseException from './BaseException';

class ProfileDeleteException extends BaseException {
  constructor(message: string = 'Error al eliminar usuario') {
    super(500, message);
  }
}

export default ProfileDeleteException;
