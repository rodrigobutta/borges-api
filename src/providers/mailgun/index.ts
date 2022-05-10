import * as fs from 'fs';
import Mailgun from 'mailgun-js';
import * as Handlebars from 'handlebars';

import settings from '../../settings';

export class MailgunWrapper {
  // Mailgun core object
  public mailgun!: Mailgun.Mailgun;

  // Test mode
  public testMode = false;

  // Mailgun Options
  public options?: Object;

  // Templates
  public templates: any = {};

  // Sender email address
  // Sender email address

  public fromEmail!: string;

  // From email title
  // From email title

  public fromTitle!: string;

  // String to prepend to message subject
  public subjectPre?: string = '';

  // String to append to message subject
  public subjectPost?: string = '';

  // Message body header
  public header?: string = '';

  // Message body footer
  public footer?: string = '';

  constructor() {}

  /**
   * Initialize
   */
  public init() {
    // Check input
    if (!this.fromEmail) {
      throw new Error('Please set MailgunWrapper::fromEmail');
    }

    if (!this.fromTitle) {
      throw new Error('Please set MailgunWrapper::fromTitle');
    }

    // Mailgun options
    let options = {
      apiKey: settings.mailgun.PRIVATE_API_KEY || '',
      domain: settings.mailgun.DOMAIN || '',
      testMode: false,
    };

    if (this.testMode) {
      options.testMode = true;
    }

    if (this.options) {
      options = Object.assign(options, this.options);
    }

    // Initialize Mailgun
    this.mailgun = new Mailgun(options);

    return this;
  }

  /**
   * Get the template object by keyname
   * @param name Keyname of the template
   */
  getTemplate(name: string): boolean | MailgunTemplate {
    if (name in this.templates) {
      return this.templates[name];
    } else {
      return false;
    }
  }

  /**
   * Send a message
   * @param to string | string[] Email Address to send message to
   * @param subject string Message subject
   * @param body string Message body
   * @param templateVars Object Template variables to send
   * @param sendOptions Object Additional message options to send
   */
  public send(
    to: string | string[],
    subject: string,
    body?: string,
    templateVars = {},
    sendOptions: any = {},
  ): Promise<any> {
    return new Promise((accept, reject) => {
      // Check mailgun
      if (!this.mailgun) {
        reject('Please call MailgunWrapper::init() before sending a message!');

        return;
      }

      // Create subject
      subject = this.subjectPre + subject + this.subjectPost;

      // Create body

      const header = this.header || '';
      body = header + body + this.footer;

      // Create message parts
      const message = {
        'from': `${this.fromTitle} <${this.fromEmail}>`,
        'to': to,
        'subject': subject,
        'html': body,
        'recipient-variables': templateVars,
        ...sendOptions,
      };

      if (!body || sendOptions?.template) {
        delete message.html;
      }

      // Send email
      this.mailgun.messages().send(message, (error, result) => {
        // Pass result through Promise
        error ? reject(error) : accept(result);
      });
    });
  }

  /**
   * Send a message from a template
   * @param to string | string[] Email Address to send message to
   * @param subject string Message subject
   * @param body string Message body
   * @param templateVars Object Template variables to send
   * @param sendOptions Object Additional message options to send
   */
  public sendFromTemplate(
    to: string | string[],
    template: MailgunTemplate,
    templateVars = {},
    sendOptions = {},
  ): Promise<any> {
    let subject, body;

    const subjectCompiler = Handlebars.compile(template.subject);
    const bodyCompiler = Handlebars.compile(template.body);

    let allVars = {};
    allVars = Object.assign(allVars, templateVars);
    allVars = Object.assign(allVars, process.env);

    subject = subjectCompiler(allVars);
    body = bodyCompiler(allVars);

    return this.send(to, subject, body, templateVars, sendOptions);
  }

  /**
   * Load header from template file
   * @param file Template file path
   */
  public loadHeaderTemplate(file: string) {
    const hbs = Handlebars.compile(fs.readFileSync(file, { encoding: 'utf8' }));

    this.header = hbs(process.env);
  }

  /**
   * Load footer from template file
   * @param file Template file path
   */
  public loadFooterTemplate(file: string) {
    const hbs = Handlebars.compile(fs.readFileSync(file, { encoding: 'utf8' }));

    this.footer = hbs(process.env);
  }
}

export class MailgunTemplate {
  public subject!: string;
  public body!: string;
}

// export const sendEmail = async ({
//   from?: string | undefined;
//   to: string | string[];
//   cc?: string | string[] | undefined;
//   bcc?: string | string∫[] | undefined;
//   subject?: string | undefined;
//   text?: string | undefined;
//   html?: string | undefined;
//   attachment?: AttachmentData | ReadonlyArray<AttachmentData> | undefined;
//   inline?: AttachmentData | ReadonlyArray<AttachmentData> | undefined;
// }) => {
//   const data: SendData = {
//     bcc: bcc || [],
//     cc: cc || [],
//     from: from,
//     html: html || "",
//     subject: subject || "",
//     text: text || "",
//     to: to,
//     inline: inline || "",
//   };

//   try {
//     return await mailgun.messages().send(data);
//   } catch (e) {
//     console.error(e);
//     throw e;
//   }
// };
