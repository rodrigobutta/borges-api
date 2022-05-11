import { IBaseException, IExceptionConfig } from './dto';

class BaseException implements IBaseException {
  status: number;
  message: string;
  config?: IExceptionConfig;
  debug: any;
  stack: any;

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
      ...(this.stack && { stack: this.config }),
      ...(this.config?.data && { data: this.config.data }),
      ...(this.config?.error && { error: this.config.error }),
    };

    console.log('>>>>>>> this.config?.error', this.config?.error);
    // if (this.config?.error) {
    //   const err = this.config.error as unknown as IRequestError;
    //   return {
    //     ...baseResponse,
    //     message: err.message,
    //     stack: err.stack || err,
    //     other: this.config.error,
    //   };
    // } else {
    return baseResponse;
    // }
  }

  getStatus() {
    return this.status;
  }
}

export default BaseException;
