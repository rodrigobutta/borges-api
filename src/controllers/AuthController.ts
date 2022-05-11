import { NextFunction, Request, Response } from 'express';
import AuthArgumentMissingException from '../exceptions/AuthArgumentMissingException';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import AuthUserHasNoCustomerException from '../exceptions/AuthUserHasNoCustomerException';
import { getCustomerById } from '../lib/customer';
import { Profile } from '../models/Profile';

import { CONSUMER_ACCOUNT_ID, ADMIN_ACCOUNT_ID } from '../constants';
import { getProfile, getUserProfiles } from '../utils/users';
import InternalError from '../exceptions/InternalError';
// import { Onboard } from '../models/Onboard';
// import ElementNotFoundError from '../exceptions/ElementNotFoundError';
// import UserAlreadyExistsException from '../exceptions/UserAlreadyExistsException';
// import { addKeycloakUser } from '../providers/keycloak';
// import settings from '../settings';

class AuthController {
  async getJwt(request: Request, response: Response, next: NextFunction) {
    try {
      return response.status(200).json({
        auth: request.auth,
      });
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async getAuthProfile(request: Request, response: Response, next: NextFunction) {
    try {
      const { authProfileId, authAccountId, auth, authUserUUID } = request;
      if (!auth || !authProfileId || !authUserUUID) {
        return next(new AuthArgumentMissingException());
      }

      const profiles = await getUserProfiles(authUserUUID);
      const dealerProfiles = profiles.filter(
        p => p.accountId !== CONSUMER_ACCOUNT_ID && p.accountId !== ADMIN_ACCOUNT_ID,
      );
      const profile =
        dealerProfiles && dealerProfiles.length > 0 // try to fetch a dealer as default, if has no dealer, any other (doesn't matter since this profile is only used for dealer purposes)
          ? dealerProfiles[0]
          : profiles[0];

      const user = await getProfile(authUserUUID, authAccountId);
      const { account, customer, ...userProps } = user;

      return response.status(200).json({
        user: userProps,
        profiles,
        profile,
        roles: [...auth.realm_access?.roles],
        jwt: auth,
      });
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async consumerLogin(request: Request, response: Response, next: NextFunction) {
    try {
      const uuid = request.auth?.sub as string;
      if (!uuid || !request.auth) {
        return next(new AuthArgumentMissingException());
      }

      const { given_name, family_name, preferred_username, azp, locale } = request.auth;

      const [user, _userWasCreated] = await Profile.findOrCreate({
        where: {
          uuid: uuid,
          accountId: CONSUMER_ACCOUNT_ID,
        },
        defaults: {
          email: preferred_username,
          firstName: given_name,
          lastName: family_name,
          authClientName: azp,
          locale,
          customerId: null,
        },
        raw: true,
        nest: true,
      });

      if (!user.customerId) {
        return next(new AuthUserHasNoCustomerException());
      }

      const customerWithScore = await getCustomerById(user.customerId);
      if (!customerWithScore) {
        return next(new CustomerNotFoundException());
      }

      return response.status(200).json({
        user,
        customer: customerWithScore,
      });
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default AuthController;
