import BaseException from './BaseException';

class PageNotFoundError extends BaseException {
  constructor(message: string = 'Página não encontrada') {
    super(404, message);
  }
}

export default PageNotFoundError;
