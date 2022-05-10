import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Customer } from '../models/Customer';
import { Profile } from '../models/Profile';
import { MailgunTemplate, MailgunWrapper } from '../providers/mailgun';
import InternalError from '../exceptions/InternalError';
import { Account } from '../models/Account';
import { Sequelize } from 'sequelize';
import ProfilePatchException from '../exceptions/ProfilePatchException';
import ProfileDeleteException from '../exceptions/ProfileDeleteException';
import { listUsers } from '../providers/keycloak';
import {
  createConsumerUserToExistingCustomer,
  createOrUpdateUser,
  deleteUser,
  getExtendedUser,
  restoreUser,
} from '../utils/users';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import ForbiddenException from '../exceptions/ForbiddenException';
import { AccountGroup } from '../models/AccountGroup';
import { AccountGroupPermission } from '../models/AccountGroupPermission';

const ITEMS_PER_PAGE = 20;

class ProfileController {
  async list(request: Request, response: Response) {
    const { authAccountId, authIsPanel } = request;
    const {
      page = null,
      search = null,
      accountId = null,
      sort, // TODO name it sort,
    } = request.query;

    const accounts: number[] = accountId
      ? typeof accountId === 'object'
        ? (accountId as unknown as number[]) // TODO hmmmmmm
        : [parseInt(accountId)]
      : [];

    const itemsPerPage = ITEMS_PER_PAGE;

    const offset = page ? (parseFloat(page as any) - 1) * itemsPerPage : undefined;

    let where: any = {
      id: {
        [Op.notIn]: [1, 2],
      },
    };

    if (!authIsPanel) {
      // a non panel user will always have restricted results to it's account
      where = {
        ...where,
        accountId: authAccountId,
      };
    } else if (accountId) {
      // A panel user can apply an account filter
      where = {
        ...where,
        accountId,
      };
    } else if (accounts && accounts.length > 0) {
      where = {
        ...where,
        accountId: {
          [Op.in]: accounts,
        },
      };
    }

    if (search) {
      if (typeof search === 'object') {
        const internalWhere = (search as unknown as string[]).reduce((acc, s) => {
          // TODO Hhmmmmm
          const searchStr = s.trim();
          return [
            ...acc,
            {
              uuid: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              firstName: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              lastName: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${searchStr}%`,
              },
            },
          ];
        }, [] as any[]);

        where = {
          ...where,
          [Op.or]: [...internalWhere],
        };
      } else {
        // a google style search, non field by field
        const searchStr = (search as string).trim();
        where = {
          ...where,
          [Op.or]: [
            {
              uuid: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              firstName: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              lastName: {
                [Op.like]: `%${searchStr}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${searchStr}%`,
              },
            },
          ],
        };
      }
    }

    const users = await Profile.findAndCountAll({
      attributes: ['uuid', 'email', 'firstName', 'lastName', 'createdAt'],
      where,
      group: ['uuid'],
      offset,
      limit: itemsPerPage,
      raw: true,
      nest: true,
      order: sort ? Sequelize.literal((sort as string).split('+').join(' ')) : [['id', 'DESC']],
    });

    // since we have the grouped users, we'll need to extend each result item with it's profiles (user row)
    const extendedUsers = await Promise.all(users.rows.map(async (user: Profile) => getExtendedUser(user)));

    // TODO sequelize bug https://github.com/sequelize/sequelize/issues/6148
    const countAfterGroup = (users.count as unknown as object[]).length;

    return response.status(200).json({
      itemsPerPage: ITEMS_PER_PAGE,
      count: countAfterGroup,
      rows: extendedUsers,
    });
  }

  async permissions(request: Request, response: Response, next: NextFunction) {
    const { authIsPanel } = request;
    if (!authIsPanel) {
      return next(new ForbiddenException());
    }

    const permissions = await AccountGroup.findAll({
      attributes: ['id', 'code', 'name', 'keycloakId'],
      include: [
        {
          model: AccountGroupPermission,
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    return response.status(200).json(permissions);
  }

  async listKeycloak(request: Request, response: Response) {
    const { page = null, search = null } = request.query;

    const _search = search as string;
    const offset = page ? (parseFloat(page as any) - 1) * ITEMS_PER_PAGE : undefined;

    const kcUsers = await listUsers({
      search: _search,
      offset,
      itemsPerPage: ITEMS_PER_PAGE,
    });

    return response.status(200).json({
      ...kcUsers,
    });
  }

  async getByUUID(request: Request, response: Response, next: NextFunction) {
    const { uuid } = request.params;

    try {
      const user = await Profile.findOne({
        include: [
          {
            model: Account,
            include: [
              {
                model: AccountGroup,
              },
            ],
          },
          {
            model: Customer,
          },
        ],
        where: {
          uuid,
        },
        raw: true,
        nest: true,
      });

      if (!user) {
        return next(new ProfileNotFoundException());
      }

      const extendedUser = await getExtendedUser(user);

      return response.status(200).json({
        ...extendedUser,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async post(request: Request, response: Response, next: NextFunction) {
    const { email, firstName, lastName, accounts } = request.body;
    const { authAccountId, authIsPanel } = request;

    try {
      const res = await createOrUpdateUser({
        email,
        firstName,
        lastName,
        requestedAccounts: accounts as number[],
        authAccountId,
        authIsPanel,
      });

      return response.status(200).send(res);
    } catch (error) {
      console.log(error);
      return next(new ProfilePatchException());
    }
  }

  async patch(request: Request, response: Response, next: NextFunction) {
    // const { uuid } = request.params; // is being received, but we dont need it anymore for the createOrUpdate
    const { email, firstName, lastName, accounts } = request.body;
    const { authAccountId, authIsPanel } = request;

    try {
      const res = await createOrUpdateUser({
        email,
        firstName,
        lastName,
        requestedAccounts: accounts as number[],
        authAccountId,
        authIsPanel,
      });

      return response.status(200).send(res);
    } catch (error) {
      console.log(error);
      return next(new ProfilePatchException());
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    const { uuid } = request.params;
    const { authIsPanel, authAccountId } = request;

    try {
      await deleteUser(uuid, authIsPanel, authAccountId);

      return response.status(200).send({
        message: 'Eliminado',
      });
    } catch (error) {
      console.log(error);
      return next(new ProfileDeleteException());
    }
  }

  async renable(request: Request, response: Response, next: NextFunction) {
    const { uuid } = request.params;
    const { authIsPanel, authAccountId } = request;

    try {
      await restoreUser(uuid, authIsPanel, authAccountId);

      return response.status(200).send({
        message: 'Restaurado',
      });
    } catch (error) {
      console.log(error);
      return next(new ProfileDeleteException());
    }
  }

  async dealerInvitesConsumerUser(request: Request, response: Response, next: NextFunction) {
    const { authProfile, authAccountId } = request;
    const { customerId } = request.body;

    try {
      const { user, customer, tmpPassword, welcomeLink } = await createConsumerUserToExistingCustomer({
        customerId,
        authAccountId,
        fromAccount: authProfile?.account,
      });

      return response.status(200).json({
        user,
        customer,
        email: user.email,
        tmpPassword,
        link: welcomeLink,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async sendContact(request: Request, response: Response) {
    const { fullname, email, subject, message } = request.body;
    try {
      const template = new MailgunTemplate();
      template.subject = 'SOLICITUD DE INFORMACIÓN';
      template.body = `
          Buenas, los datos del contacto son: <br />
          <br />
          <strong> - Nombre y Apellido: </strong> {{fullname}}<br />
          <strong> - E-mail: </strong> {{email}}<br />
          <strong> - Asunto: </strong> {{subject}}<br />
          <strong> - Mensaje: </strong> {{message}}<br />
          <br />
          Saludos.
          `;

      const mailer = new MailgunWrapper();
      mailer.fromEmail = 'noreply@aracargroup.com';
      mailer.fromTitle = 'Aracar';
      mailer.init();

      if (template && template instanceof MailgunTemplate) {
        await mailer
          .sendFromTemplate('info@aracargroup.com', template, {
            fullname,
            email,
            subject,
            message,
          })
          .catch(error => {
            console.error(error);
          });
        return response.status(200).send({
          send: 'OK',
        });
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }
}

export default ProfileController;
