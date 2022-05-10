import BaseException from './BaseException';

class FileUploadException extends BaseException {
  constructor(message: string = 'Erro ao carregar o arquivo') {
    super(400, message);
  }
}

export default FileUploadException;
