import { NextFunction, Request, Response } from 'express';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import SignDocumentException from '../exceptions/SignDocumentException';
import SignDocumentNotFoundException from '../exceptions/SignDocumentNotFoundException';
import { Customer } from '../models/Customer';
import { Document } from '../models/Document';
import { DocumentSignature } from '../models/DocumentSignature';
// import { Lead } from "../models/Lead";
import settings from '../settings';
import { signDocument } from '../providers/documents';
import SignDocumentArgumentMissingException from '../exceptions/SignDocumentArgumentMissingException';

class SignDocumentController {
  async view(request: Request, response: Response, next: NextFunction) {
    const { documentId } = request.params;
    const { customerId } = request.query;

    try {
      const document = await Document.findByPk(documentId);
      // console.log("documentId", documentId)
      const documentSign = await DocumentSignature.findOne({
        where: { customerId, documentId },
      });

      if (!document) return next(new SignDocumentNotFoundException());
      response.status(200).send({
        res: 'OK',
        document: {
          name: document.name,
          title: document.title,
          url: document.sourceFile, //`https://borgesbrasil.s3.us-east-2.amazonaws.com/scr-2021.pdf`,
        },
        ...(documentSign && {
          sign: {
            id: documentSign.id,
            signedAt: documentSign.createdAt,
            url: `${documentSign.signedFile}`,
          },
        }),
      });
    } catch (err: any) {
      return next(new SignDocumentException(err.message));
    }
  }

  async sign(request: Request, response: Response, next: NextFunction) {
    const { authProfileId, body } = request;
    const { customerId, documentId, signatureText = null } = body;

    try {
      if (!authProfileId) {
        return next(new SignDocumentArgumentMissingException('Usuario não foi encontrado'));
      }

      const document = await Document.findByPk(documentId);
      const customer = await Customer.findByPk(customerId, {
        nest: true,
        raw: true,
      });

      console.log();

      if (!document) {
        return next(new SignDocumentNotFoundException());
      }

      if (!customer) {
        return next(new LeadNotFoundException());
      }

      const now = new Date();
      const locale = settings.locale || 'pt-BR'; // TODO not working lang, replace for array of moths
      const month = now.toLocaleString(locale, { month: 'long' });

      const signatureDrawingFile =
        request.files && request.files['signatureDrawing'] ? request.files['signatureDrawing'] : null;

      const data = {
        fullname: `${customer.firstName} ${customer.lastName}`,
        cpf: customer.citizenNumber,
        signYear: now.getFullYear().toString().substr(-2),
        signMonth: month,
        signDay: now.getDate(),
        // signature,
        signatureText,
        signatureDrawing: signatureDrawingFile,
      };
      const signedFile = await signDocument(document, data, 'S3');
      console.log('signedFile', signedFile);

      const documentSign = await DocumentSignature.create({
        documentId,
        customerId,
        userId: authProfileId,
        signedFile,
      });

      response.status(200).send({
        res: 'OK',
        document: {
          name: document.name,
          title: document.title,
          url: document.sourceFile,
        },
        sign: {
          id: documentSign.id,
          signedAt: documentSign.createdAt,
          url: `${documentSign.signedFile}`,
        },
      });
    } catch (err: any) {
      console.error(err);
      return next(new SignDocumentException(err.message));
    }
  }
}

export default SignDocumentController;
