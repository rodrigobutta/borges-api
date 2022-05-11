import { NextFunction, Request, Response } from 'express';
import InternalError from '../exceptions/InternalError';
import { migrateDealerUser } from '../utils/users';

class BatchController {
  async migrateDealerUser(request: Request, response: Response, next: NextFunction) {
    const { authIsAdmin } = request;
    const { email, password } = request.body;

    try {
      const {
        firstName,
        lastName,
        uuid,
        userRestored,
        userCreated,
        assignedProfiles,
        password: finalPassword,
      } = await migrateDealerUser({
        email,
        password,
        authIsAdmin,
      });

      return response.status(200).json({
        email,
        firstName,
        lastName,
        uuid,
        userRestored,
        userCreated,
        assignedProfiles,
        password: finalPassword,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }
}

export default BatchController;
