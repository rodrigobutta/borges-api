import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import AuthTokenMissingException from '../exceptions/AuthTokenMissingException';
import AuthTokenInvalidException from '../exceptions/AuthTokenInvalidException';
import settings from '../settings';
// import ProfileNotFoundException from '../exceptions/UserNotFoundException';
import { Profile } from '../models/Profile';
import { CONSUMER_ACCOUNT_ID, PANEL_ACCOUNT_ID } from '../constants';
import { KeycloakJWT, KeycloakGroup } from '../types/keycloak';
import InternalError from '../exceptions/InternalError';
import { Account } from '../models/Account';
import { Client } from '../models/Client';

async function authMiddleware(request: Request, _: Response, next: NextFunction) {
  // console.log("MIDDLEWARE HEADERS", request.headers);

  const authHeader: string = request.headers.authorization as string;

  const currentProfileId: number | null = request.headers['current-profile-id']
    ? typeof request.headers['current-profile-id'] === 'string'
      ? parseInt(request.headers['current-profile-id'])
      : (request.headers['current-profile-id'] as unknown as number)
    : null;

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    next(new AuthTokenMissingException());
  }

  const algorithm = settings.auth.algorithm as jwt.Algorithm;

  try {
    const decodedToken = jwt.verify(token, settings.auth.publicKey, {
      algorithms: [algorithm],
    });
    const extendedToken = decodedToken as KeycloakJWT;
    if (extendedToken) {
      request.auth = extendedToken;

      // TODO refactor wit new accountGroup entity
      // Depends on the Keycloak Client that is being used to authenticate
      const group = extendedToken.profile
        ? extendedToken.profile === KeycloakGroup.Panel
          ? KeycloakGroup.Panel
          : extendedToken.profile === KeycloakGroup.Dealer
          ? KeycloakGroup.Dealer
          : extendedToken.profile === KeycloakGroup.Consumer
          ? KeycloakGroup.Consumer
          : null
        : null;
      if (!group) {
        return next(new AuthTokenInvalidException("We couldn't determine the Keycloak Group from KC client mappers"));
      }
      request.authGroup = group;
      request.authUserUUID = request.auth.sub || undefined;

      // console.log('AUTH EXTENDED TOKEN', extendedToken);
      // console.log('AUTH GROUP', request.authGroup);

      let where: any = {
        uuid: request.authUserUUID,
      };
      switch (group) {
        case KeycloakGroup.Panel:
          where = {
            ...where,
            accountId: PANEL_ACCOUNT_ID,
          };
          break;

        case KeycloakGroup.Consumer:
          where = {
            ...where,
            accountId: CONSUMER_ACCOUNT_ID,
          };
          break;

        // Case for Dealer (can have multiple dealer accounts)
        default:
          where = {
            ...where,
            accountId: {
              [Op.notIn]: [PANEL_ACCOUNT_ID, CONSUMER_ACCOUNT_ID],
            },
          };

          // if selected profile we assume user has multiple dealer accounts so it's working with one of them
          if (currentProfileId) {
            where = {
              ...where,
              id: currentProfileId,
            };
          }

          break;
      }

      let profile = null;
      try {
        // TODO we'll have to manage cases for users who'll have multiple dealers accounts, with some HEAD accountId extra from clients may be
        profile = await Profile.findOne({
          where,
          include: [
            {
              model: Account,
            },
          ],
        });
      } catch (error) {
        next(new InternalError(error));
      }
      if (profile) {
        request.authProfile = profile;
        request.authAccountId = profile.accountId;
        request.authProfileId = profile.id;

        // should only be filled for Consumer users (Customers)
        if (group === KeycloakGroup.Consumer) {
          try {
          } catch (error) {
            next(new InternalError(error));
          }
        }
      }

      try {
        const client = await Client.findOne({
          where: {
            code: extendedToken.azp,
          },
          raw: true,
          nest: true,
        });
        if (client) {
          request.authClient = client;
        }
      } catch (error) {
        next(new InternalError(error));
      }

      // Depends on the Keycloak Profile Group / Roles
      request.authIsPanel = (request.authAccountId && request.authAccountId === PANEL_ACCOUNT_ID) || false;
      request.authIsDealer =
        (request.authAccountId &&
          request.authAccountId !== PANEL_ACCOUNT_ID &&
          request.authAccountId !== CONSUMER_ACCOUNT_ID) ||
        false;
      request.authIsConsumer = (request.authAccountId && request.authAccountId === CONSUMER_ACCOUNT_ID) || false;

      // console.log("AUTH PROFILE ID", request.authProfileId);
      // console.log("AUTH ACCOUNT ID", request.authAccountId);

      next();
    } else {
      next(new AuthTokenInvalidException());
    }
  } catch (err: any) {
    console.log('AuthTokenInvalidException:', err);
    next(new AuthTokenInvalidException());
  }
}

export default authMiddleware;
