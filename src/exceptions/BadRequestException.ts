import BaseException from './BaseException';
import { IExceptionConfig } from './dto';

class BadRequestException extends BaseException {
  constructor(message: string = 'Element not found', validations?: any, config?: IExceptionConfig) {
    super(400, message, { ...config, data: { ...config?.data, validations } });
  }
}

export default BadRequestException;
