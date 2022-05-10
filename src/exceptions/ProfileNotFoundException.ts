import BaseException from './BaseException';

class ProfileAlreadyPairedException extends BaseException {
  constructor(message: string = 'User not found') {
    super(404, message);
  }
}

export default ProfileAlreadyPairedException;
