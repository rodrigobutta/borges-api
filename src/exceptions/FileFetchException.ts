import BaseException from './BaseException';

class FileFetchException extends BaseException {
  constructor(message: string = 'Erro ao recuperar o arquivo') {
    super(500, message);
  }
}

export default FileFetchException;
