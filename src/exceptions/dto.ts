import { ErrorRequestHandler } from 'express';

export interface IExceptionConfig {
  error?: ErrorRequestHandler;
  data?: any;
}
export interface IBaseException extends IExceptionConfig {
  status: number;
  message: string;
  getMessage: Function;
  getStatus: Function;
}

export interface IRequestError {
  message: string;
  stack?: string;
}
