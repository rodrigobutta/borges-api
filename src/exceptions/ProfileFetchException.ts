import BaseException from './BaseException';

class ProfileFetchException extends BaseException {
  constructor(message: string = 'Erro recuperando usuarios') {
    super(500, message);
  }
}

export default ProfileFetchException;
