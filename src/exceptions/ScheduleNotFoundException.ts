import BaseException from './BaseException';
import { ErrorRequestHandler } from 'express';

class ScheduleNotFoundException extends BaseException {
  constructor(error?: ErrorRequestHandler) {
    super(404, 'Cronograma não encontrado', { error: error });
  }
}

export default ScheduleNotFoundException;
