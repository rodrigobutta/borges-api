import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import BaseException from '../exceptions/BaseException';
import ServerError from '../exceptions/ServerError';
import PageNotFoundError from '../exceptions/PageNotFoundError';

export const errorHandler = (error: ErrorRequestHandler, _request: Request, response: Response, next: NextFunction) => {
  if (error) {
    const errorInstance = error instanceof BaseException ? error : new ServerError(error);

    return response.status(errorInstance.getStatus()).json(errorInstance.getMessage());
  }

  next();
};

export const routeNotFoundHandler = (_request: Request, _response: Response, next: NextFunction) => {
  next(new PageNotFoundError());
};
