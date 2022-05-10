import BaseException from './BaseException';

class FileArgumentMissingException extends BaseException {
  constructor(message: string = 'Parâmetros de arquivo inválidos') {
    super(400, message);
  }
}

export default FileArgumentMissingException;
