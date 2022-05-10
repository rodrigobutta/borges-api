import { NextFunction, Request, Response } from 'express';
import { MailgunWrapper, MailgunTemplate } from '../providers/mailgun';

class TestController {
  async mailSend(request: Request, response: Response, _next: NextFunction) {
    const { mail } = request.body;

    try {
      const mailer = new MailgunWrapper();
      mailer.fromEmail = 'noreply@borges.com';
      mailer.fromTitle = 'Borges';
      mailer.init();

      await mailer
        .send(mail, 'Hello!', '<h1>hsdf</h1>')
        .then((result: any) => console.log('Done', result))
        .catch((error: any) => console.error('Error: ', error));

      return response.status(200).send({
        test: 'OK',
      });
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async mailSendTemplate(request: Request, response: Response, _next: NextFunction) {
    const { mail } = request.body;

    try {
      const template = new MailgunTemplate();
      template.subject = 'Welcome, {{username}}';
      template.body = '<h1>Email: {{email}}</h1>';

      const mailer = new MailgunWrapper();
      mailer.fromEmail = 'noreply@borges.com';
      mailer.fromTitle = 'Borges';
      mailer.init();

      if (template && template instanceof MailgunTemplate) {
        await mailer
          .sendFromTemplate(mail, template, {
            username: 'testuser',
            email: 'testuser@borges.com',
          })
          .catch(error => {
            console.error(error);
          });
      }

      return response.status(200).send({
        test: 'OK',
      });
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }
}

export default TestController;
