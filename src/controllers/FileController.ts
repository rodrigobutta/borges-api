import { NextFunction, Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import FileArgumentMissingException from '../exceptions/FileArgumentMissingException';
import FileUploadException from '../exceptions/FileUploadException';
import FileFetchException from '../exceptions/FileFetchException';
import { getObject, upload } from '../providers/aws/s3';

class FileController {
  async post(request: Request, response: Response, next: NextFunction) {
    // const { bucket = null } = request.body; // TODO buckets not implemented yet in S3 class

    const file: UploadedFile | undefined = request.files && (request.files['file'] as UploadedFile);
    if (!file) {
      return next(new FileArgumentMissingException());
    }

    const { suggestedFileName } = request.body;

    try {
      const uploadedFile = await upload(
        file.data,
        suggestedFileName || `${Date.now()}_${file.name.replace(/\s+/g, '')}`,
      );

      return response.status(200).send({
        name: uploadedFile.name,
        url: uploadedFile.url,
      });
    } catch (e) {
      console.log('error', e);
      return next(new FileUploadException());
    }
  }

  async get(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new FileArgumentMissingException());
    }

    try {
      const file = await getObject(id);

      return response.status(200).send(file);
    } catch (e) {
      console.log('error', e);
      return next(new FileFetchException());
    }
  }
}

export default FileController;
