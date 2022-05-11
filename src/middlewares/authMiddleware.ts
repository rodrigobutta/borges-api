import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import AuthTokenMissingException from '../exceptions/AuthTokenMissingException';
import AuthTokenInvalidException from '../exceptions/AuthTokenInvalidException';
import settings from '../settings';
// import ProfileNotFoundException from '../exceptions/UserNotFoundException';
import { Profile } from '../models/Profile';
import { ADMIN_ACCOUNT_ID } from '../constants';
import { KeycloakJWT } from '../types/keycloak';
import InternalError from '../exceptions/InternalError';
import { Account } from '../models/Account';
import { Client } from '../models/Client';

async function authMiddleware(request: Request, _: Response, next: NextFunction) {
  // console.log("MIDDLEWARE HEADERS", request.headers);

  const authHeader: string = request.headers.authorization as string;

  // const currentProfileId: number | null = request.headers['current-profile-id']
  //   ? typeof request.headers['current-profile-id'] === 'string'
  //     ? parseInt(request.headers['current-profile-id'])
  //     : (request.headers['current-profile-id'] as unknown as number)
  //   : null;

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
    if (!extendedToken) {
      next(new AuthTokenInvalidException(`Couldnt decode de JWT token with PUBLIC ${settings.auth.publicKey}`));
    }

    request.auth = extendedToken;
    request.authUserUUID = request.auth.sub || undefined;

    // console.log('AUTH EXTENDED TOKEN', extendedToken);
    // console.log('AUTH GROUP', request.authGroup);

    let where: any = {
      uuid: request.authUserUUID,
    };

    let profile = null;
    try {
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
    request.authIsAdmin = (request.authAccountId && request.authAccountId === ADMIN_ACCOUNT_ID) || false;

    next();
  } catch (error: any) {
    next(new InternalError(error, settings.auth));
  }
}

export default authMiddleware;
