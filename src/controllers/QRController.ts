import { NextFunction, Request, Response } from 'express';
import QRCode from 'qrcode';
import QRArgumentMissingException from '../exceptions/QRArgumentMissingException';

class QRController {
  async post(request: Request, response: Response, next: NextFunction) {
    if (!request.body.data) {
      return next(new QRArgumentMissingException());
    }
    const format = request.body.format ? request.body.format : 'svg';

    response.status(200).send({
      qr: await (await QRCode.toString(request.body.data, { type: format })).trim(),
      format,
    });
  }
}

export default QRController;
