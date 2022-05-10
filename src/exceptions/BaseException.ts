import { IBaseException, IExceptionConfig, IRequestError } from './dto';

class BaseException implements IBaseException {
  status: number;
  message: string;
  config?: IExceptionConfig;
  debug: any;

  constructor(status: number, message: string, config: IExceptionConfig = {}, debug: any = {}) {
    this.status = status;
    this.message = message;
    this.config = config;
    this.debug = debug;
  }

  getMessage() {
    const baseResponse = {
      status: this.status,
      message: this.message,
      ...(this.debug && { debug: this.debug }),
      ...(this.config?.data && { data: this.config.data }),
    };

    if (this.config?.error) {
      const err = this.config.error as unknown as IRequestError;
      return {
        ...baseResponse,
        message: err.message,
        stack: err.stack,
      };
    } else {
      return baseResponse;
    }
  }

  getStatus() {
    return this.status;
  }
}

export default BaseException;
