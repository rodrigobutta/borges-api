import BaseException from './BaseException';

class ResourceAlreadyExistsError extends BaseException {
  constructor() {
    super(409, 'Recurso já existe');
  }
}

export default ResourceAlreadyExistsError;
