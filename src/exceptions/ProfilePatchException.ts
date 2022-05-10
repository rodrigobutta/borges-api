import BaseException from './BaseException';

class ProfilePatchException extends BaseException {
  constructor(message: string = 'Error al actualizar usuario') {
    super(500, message);
  }
}

export default ProfilePatchException;
