import { NextFunction, Request, Response } from 'express';
import { Account } from '../models/Account';
import AccountArgumentMissingException from '../exceptions/FileArgumentMissingException';
import AccountFetchException from '../exceptions/AccountFetchException';
import AccountUpdateException from '../exceptions/AccountUpdateException';
import { AccountFiles } from '../models/AccountFiles';
import AccountFileFetchException from '../exceptions/AccountFileFetchException';
import FileArgumentMissingException from '../exceptions/FileArgumentMissingException';
import { upload } from '../providers/aws/s3';
import { UploadedFile } from 'express-fileupload';
import { Sequelize } from 'sequelize';
import {
  getTemplateInvitationMail,
  getWhereAccount,
  requiredFieldsCompleted,
  validationResult,
} from '../utils/accountUtils';
import { MailgunWrapper, MailgunTemplate } from '../providers/mailgun';
import { Profile } from '../models/Profile';
import UserAlreadyExistsException from '../exceptions/UserAlreadyExistsException';
import settings from '../settings';
import { sign } from 'jsonwebtoken';
import path from 'path';
import InternalError from '../exceptions/InternalError';
import { GridQueryParser } from '../utils/GridQueryParser';

import BadRequestException from '../exceptions/BadRequestException';
import {
  DealerTableAssignation,
  deleteAccount,
  getAccountGroupPermissions,
  getAccountGroupRoles,
  getAccountOrigin,
  patchDealerCommissionTableAssignations,
} from '../lib/account';
import { createDealerWithUser } from '../utils/users';
import { DealerCommissionTableAssignment } from '../models/DealerCommissionTableAssignment';
import { DealerCommissionTable } from '../models/DealerCommissionTable';

const BASE_URL =
  process.env.SSL_DOMAIN === 'br.api.borges.com'
    ? 'https://br.dealers.borges.com/'
    : 'https://br.dealers.test.borges.com/';

class AccountController {
  async invite(request: Request, response: Response, next: NextFunction) {
    const isValid: boolean = validationResult(request);
    if (!isValid) {
      return next();
    }

    const { email, name } = request.body;

    try {
      let user = await Profile.findOne({
        where: { email: email },
      });
      if (user && user.accountId !== request.body.accountId) {
        return next(new UserAlreadyExistsException());
      }

      try {
        const account = await Account.create({
          name: name,
        });

        //Create an user.
        if (!user) {
          user = await Profile.create({
            ...request.body,
            accountId: account.id,
          });
        }
        try {
          const template = new MailgunTemplate();
          template.subject = 'Validación de cuenta';
          template.body = await getTemplateInvitationMail();

          const mailer = new MailgunWrapper();
          mailer.fromEmail = 'noreply@borges.com';
          mailer.fromTitle = 'Borges Consumer';
          mailer.init();

          if (template && template instanceof MailgunTemplate) {
            let filename = path.join(__dirname, '../../imgs/BorgesLogo.jpg');
            await mailer
              .sendFromTemplate(
                email,
                template,
                {
                  firstname: 'Nicolás',
                  url: `${BASE_URL}invitation/` + sign({ email }, settings.jwtSecret),
                  label: 'Clique aqui',
                  title: 'Clique no link abaixo para redefinir sua senha',
                },
                {
                  inline: filename,
                },
              )
              .catch(error => {
                console.error(error);
              });
          }

          return response.status(200).send({
            test: 'OK',
          });
        } catch (e) {
          console.log(e);
        }

        // TODO unificar proceso de alta de account

        // sorry
        // await Location.create({
        //   name: "Principal",
        //   accountId: account.id,
        //   address: "",
        // });

        // sorry (bis)
        // await models.status.bulkCreate([
        //   {
        //     name: "Disponible",
        //     accountId: account.id,
        //     color: "#33691e",
        //   },
        //   {
        //     name: "Reservado",
        //     accountId: account.id,
        //     color: "#795548",
        //   },
        //   {
        //     name: "Bloqueado",
        //     accountId: account.id,
        //     color: "#01579b",
        //   },
        //   {
        //     name: "En preparación",
        //     accountId: account.id,
        //     color: "#004d40",
        //   },
        //   {
        //     name: "Em tránsito",
        //     accountId: account.id,
        //     color: "#827717",
        //   },
        //   {
        //     name: "Vendido",
        //     accountId: account.id,
        //     color: "#4a148c",
        //   },
        // ]);
      } catch (e: any) {
        console.log(e);
        // if (e.name === "SequelizeValidationError") {
        //   res
        //     .status(400)
        //     .send("Validation errors: " + e.errors.map((x) => x.path.split("-")));
        // } else {
        //   res.status(500).send("Error creating record.");
        // }
      }
    } catch (ex: any) {
      // res.status(500).send(ex.message);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new AccountArgumentMissingException());
    }
    let body = request.body;

    const reqFields = requiredFieldsCompleted(body);

    if (reqFields.hasError) {
      response.status(400).send({
        message: 'Campos obrigatórios ausentes: '.concat(reqFields.uncompletedFields.join(', ')),
        requiredFields: reqFields.uncompletedFields,
      });
    } else {
      try {
        body['infoComplete'] = true;

        const account = await Account.update(body, {
          where: {
            id: id,
          },
        });
        // TODO REB merge
        // const extendedAccounts = await Promise.all(
        // 	accounts.rows.map(async (a) => {
        // 		const permissions = await getAccountGroupPermissions(
        // 			a.accountGroupId
        // 		);
        // 		const roles = await getAccountGroupRoles(a.accountGroupId);

        // 		return {
        // 			...a,
        // 			origin: getAccountOrigin(a),
        // 			roles,
        // 			permissions,
        // 		};
        // 	})
        // );

        return response.status(200).send(account);
      } catch (e) {
        console.log('error', e);
        return next(new AccountUpdateException());
      }
    }
  }

  async getById(request: Request, response: Response, next: NextFunction) {
    const { id = null } = request.params;
    if (!id) {
      return next(new AccountArgumentMissingException());
    }

    try {
      const account = await Account.findByPk(id);
      // TODO REMOVE on next iteration
      //* This should be removed once salesPersonBorges is a real entity on the DB
      //* or references a user or other entity from the db
      let rta: any = {
        ...account,
      };

      return response.status(200).send(rta.dataValues);
    } catch (e) {
      console.log('error', e);
      return next(new AccountFetchException());
    }
  }

  async getFiles(request: Request, response: Response, next: NextFunction) {
    const { authAccountId, authIsDealer } = request;
    const id = authIsDealer ? authAccountId : request.params.id;
    const { name } = request.query;

    if (!id) {
      return next(new AccountArgumentMissingException());
    }

    try {
      const accounts = await AccountFiles.findAll({
        where: {
          accountId: id,
          name,
        },
      });

      return response.status(200).send(accounts);
    } catch (e) {
      console.log('error', e);
      return next(new AccountFileFetchException());
    }
  }

  async addFile(request: Request, response: Response, next: NextFunction) {
    const { authAccountId, authIsDealer } = request;
    const id = authIsDealer ? authAccountId : request.params.id;
    const { name } = request.body;

    if (!id) {
      return next(new AccountArgumentMissingException());
    }

    if (!request.files?.file) {
      return next(new FileArgumentMissingException('File missing'));
    } else if (!name) {
      return next(new FileArgumentMissingException('Name missing'));
    }

    const file: UploadedFile | undefined = request.files && (request.files['file'] as UploadedFile);
    if (!file) {
      return next(new FileArgumentMissingException());
    }

    const rta = await upload(file.data, `${id}_${file.name.replace(/\s+/g, '')}`);

    const [record] = await AccountFiles.upsert({
      url: rta.url,
      name: name, //`${id}_${file.name.replace(/\s+/g, "")}`,
      mimetype: file.mimetype,
      originalName: file.name.replace(/\s+/g, ''),
      accountId: id,
    });

    return response.status(200).send(record);
  }

  async getAssignedCommissionTables(request: Request, response: Response, next: NextFunction) {
    const { authIsPanel } = request;
    const { accountId } = request.params;

    if (!authIsPanel) {
      return next(new BadRequestException(`This endpoint needs to be consumed by a panel profile.`));
    }
    if (!accountId) {
      return next(new BadRequestException('Conta não precisada'));
    }

    try {
      const tables = await DealerCommissionTableAssignment.findAll({
        attributes: ['customerAnalysisScore', 'dealerCommissionTableId'],
        include: [
          {
            model: DealerCommissionTable,
            attributes: ['id', 'code'],
          },
        ],
        where: {
          accountId,
        },
        raw: true,
        nest: true,
      });

      return response.json(tables);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async patchAssignedCommissionTables(request: Request, response: Response, next: NextFunction) {
    const { authIsPanel } = request;
    const { accountId } = request.params;
    const { data } = request.body;

    const assigns = data as unknown as DealerTableAssignation[];

    if (!authIsPanel) {
      return next(new BadRequestException(`This endpoint needs to be consumed by a panel profile.`));
    }
    if (!accountId) {
      return next(new BadRequestException('Conta não precisada'));
    }

    try {
      await patchDealerCommissionTableAssignations(accountId, assigns);
    } catch (error) {
      console.log(error);
      return next(new InternalError());
    }

    return response.status(200).send({ message: 'OK' });
  }

  async search(request: Request, response: Response, next: NextFunction) {
    const { limit, page, filters } = GridQueryParser.parse(request.query);

    let where: any = getWhereAccount(filters);

    try {
      const body = await Account.findAndCountAll({
        offset: page ? (Number(page) - 1) * Number(limit) : undefined,
        limit: Number(limit),
        where: where,
        raw: true,

        attributes: [
          'id',
          'name',
          'salesPersonBorges',
          [
            Sequelize.literal('(SELECT COUNT(locations.id) FROM locations WHERE locations.accountId = id)'),
            'locationCount',
          ],
          [Sequelize.literal('(SELECT MAX(users.lastVisit) FROM users WHERE users.accountId = id)'), 'lastVisit'],
          [Sequelize.literal('(SELECT COUNT(users.id) FROM users WHERE users.accountId = id)'), 'userCount'],
          [
            Sequelize.literal(
              `(SELECT CONCAT(users.firstName," ", users.lastName) FROM users WHERE users.accountId = id ORDER BY users.lastVisit desc LIMIT 1)`,
            ),
            'lastVisitUser',
          ],
        ],
      });

      // TODO REMOVE on next iteration
      //* This should be removed once salesPersonBorges is a real entity on the DB
      //* or references a user or other entity from the db
      const rta = {
        ...body,
        rows: body.rows.map(row => {
          return {
            ...row,
          };
        }),
      };
      response.status(200).send(rta);
      // response.status(200).send(body);
    } catch (e: any) {
      console.log(e);
      return next(new AccountFetchException());
    }
  }

  async list(request: Request, response: Response, next: NextFunction) {
    const { name, qt } = request.query;

    try {
      if (qt === 'select') {
        const accounts = await Account.findAll({
          attributes: [
            ['id', 'value'],
            ['name', 'text'],
          ],
          order: [['name', 'ASC']],
          raw: true,
        });

        return response.status(200).send(accounts);
      } else if (qt === 'pg-v2') {
        const { limit, page, filters } = GridQueryParser.parse(request.query);

        let where: any = getWhereAccount(filters);

        const body = await Account.findAndCountAll({
          offset: page ? (Number(page) - 1) * Number(limit) : undefined,
          limit: Number(limit),
          where: where,
          raw: true,
          attributes: [
            'id',
            'name',
            'salesPersonBorges',
            'updatedAt',
            [
              Sequelize.literal('(SELECT COUNT(locations.id) FROM locations WHERE locations.accountId = Account.id)'),
              'locationCount',
            ],
            [Sequelize.literal('(SELECT MAX(users.lastVisit) FROM users WHERE users.accountId = id)'), 'lastVisit'],
            [Sequelize.literal('(SELECT COUNT(users.id) FROM users WHERE users.accountId = Account.id)'), 'userCount'],
            [
              Sequelize.literal(
                `(SELECT CONCAT(users.firstName," ", users.lastName) FROM users WHERE users.accountId = Account.id ORDER BY users.lastVisit desc LIMIT 1)`,
              ),
              'lastVisitUser',
            ],
          ],
        });

        // TODO REMOVE on next iteration
        //* This should be removed once salesPersonBorges is a real entity on the DB
        //* or references a user or other entity from the db
        const rta = {
          ...body,
          rows: body.rows.map(row => {
            return {
              ...row,
            };
          }),
        };
        response.status(200).send(rta);
      } else {
        const where = {
          ...(name && { name }),
        };

        const accounts = await Account.findAndCountAll({
          attributes: ['id', 'name', 'accountGroupId'],
          include: [],
          where,
          order: [['name', 'ASC']],
          raw: true,
        });

        const extendedAccounts = await Promise.all(
          accounts.rows.map(async a => {
            const permissions = await getAccountGroupPermissions(a.accountGroupId);
            const roles = await getAccountGroupRoles(a.accountGroupId);

            return {
              ...a,
              origin: getAccountOrigin(a),
              roles,
              permissions,
            };
          }),
        );

        return response.status(200).send({
          count: accounts.count,
          rows: extendedAccounts,
        });
      }
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async newDealerWithUser(request: Request, response: Response, next: NextFunction) {
    const { city, companyName, email, firstName, lastName, companyIDNumber, state, zipCode } = request.body;

    try {
      const { user, account, tmpPassword, welcomeLink } = await createDealerWithUser({
        email,
        firstName,
        lastName,
        companyIDNumber: companyIDNumber,
        accountName: companyName,
        accountCity: city,
        accountState: state,
        accountZipCode: zipCode,
      });

      return response.status(200).json({
        user,
        account,
        uuid: user.uuid,
        email,
        tmpPassword,
        link: welcomeLink,
      });
    } catch (error) {
      console.log(error);
      // return response.status(500).send(error);
      return next(new InternalError(error));
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    const { accountId } = request.params;
    const { authIsPanel } = request;

    if (!accountId) {
      throw next(new BadRequestException('Account ID not present'));
    }

    const id = parseInt(accountId);

    try {
      await deleteAccount(id, authIsPanel);

      return response.status(200).send({
        message: 'Cuenta eliminada',
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }
}

export default AccountController;
