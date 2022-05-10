import { NextFunction, Request, Response } from 'express';
import AuthArgumentMissingException from '../exceptions/AuthArgumentMissingException';
import AuthPairArgumentMissingException from '../exceptions/AuthPairArgumentMissingException';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import AuthUserHasNoCustomerException from '../exceptions/AuthUserHasNoCustomerException';
import ProfileAlreadyPairedException from '../exceptions/UserAlreadyPairedException';
import { getCustomerById } from '../lib/customer';
import { Customer } from '../models/Customer';
import { Profile } from '../models/Profile';
import { Lead } from '../models/Lead';
import { CONSUMER_ACCOUNT_ID, PANEL_ACCOUNT_ID } from '../constants';
import { addLeadActivity } from '../lib/leadActivity';
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
        p => p.accountId !== CONSUMER_ACCOUNT_ID && p.accountId !== PANEL_ACCOUNT_ID,
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

  async consumerPair(request: Request, response: Response, next: NextFunction) {
    try {
      const now = new Date();

      // TODO we could be checking by email instead of uuid
      const uuid = request.auth?.sub as string;
      if (!uuid || !request.auth) {
        return next(new AuthArgumentMissingException());
      }

      const { citizenNumber, jobType } = request.body;
      if (!citizenNumber || !jobType) {
        return next(new AuthPairArgumentMissingException());
      }

      const { given_name, family_name, preferred_username } = request.auth;
      const user = await Profile.findOne({
        where: {
          uuid: uuid,
          accountId: CONSUMER_ACCOUNT_ID,
        },
        raw: true,
        nest: true,
      });
      if (!user) {
        return next(new ProfileNotFoundException());
      }
      if (user.customerId) {
        return next(new ProfileAlreadyPairedException());
      }

      const origin = 'consumer'; // TODO integrate origin

      // 99% of times, we'll be creating a customer but in case a customer already existed with the citizen number
      // we need to associate that one instead of create a new one
      const [customer, customerWasCreated] = await Customer.findOrCreate({
        where: {
          citizenNumber,
        },
        defaults: {
          firstName: given_name,
          lastName: family_name,
          email: preferred_username,
          jobType,
          citizenNumber: citizenNumber, // TODO just in case, until we remove dirt
        },
        raw: true,
        nest: true,
      });

      const lead = await Lead.create({
        customerId: customer.id,
        accountId: CONSUMER_ACCOUNT_ID,
        userId: user.id,
        origin,
        lastInteractionAt: now,
        lastInteractionUserId: user.id,
        lastInteractionOrigin: origin,
      });
      if (!lead) {
        return next(new CustomerNotFoundException());
      }

      const activityType = customerWasCreated
        ? 'consumer-register-existing-customer'
        : 'consumer-register-new-customer';

      await addLeadActivity({
        leadId: lead.id,
        typeCode: activityType,
        profileId: user.id,
      });

      // Associate the user with the just created or retrieved customer
      await Profile.update(
        {
          customerId: customer.id,
        },
        {
          where: {
            id: user.id,
          },
        },
      );

      const customerWithScore = await getCustomerById(customer.id);
      if (!customerWithScore) {
        return next(new CustomerNotFoundException());
      }

      return response.status(200).json({
        user,
        customer: customerWithScore,
        customerWasCreated,
      });
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default AuthController;
