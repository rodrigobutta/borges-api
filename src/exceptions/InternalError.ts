import { ErrorRequestHandler } from 'express';
import BaseException from './BaseException';

class InternalError extends BaseException {
  constructor(error?: BaseException | ErrorRequestHandler | string | any, debug?: any) {
    console.error('InternalError:', error);
    console.log('InternalError DEBUG:', debug);

    // if we already have an Exception, throw that one instead of the 500, because it might be a controlled one
    if (error instanceof BaseException) {
      super(error.status, error.message, { error: error.config?.error }, error.debug);

      // }
      // else if (error instanceof ErrorRequestHandler) {

      //     super(error.status, error.message, { error: error.error }, error.debug);
    } else if (typeof error === 'string') {
      super(500, error, {}, debug);
    } else if (error) {
      console.log('ERORRRRR 2', error);
      super(500, 'Internal error 2', { error }, debug);
    } else {
      super(500, 'Internal error 3', {}, debug);
    }
  }
}

export default InternalError;
