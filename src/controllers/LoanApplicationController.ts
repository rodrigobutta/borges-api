import { NextFunction, Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Op } from 'sequelize';
import FileArgumentMissingException from '../exceptions/FileArgumentMissingException';
import FileUploadException from '../exceptions/FileUploadException';
import LoanApplicationArgumentMissingException from '../exceptions/LoanApplicationArgumentMissingException';
import { Customer } from '../models/Customer';
import { Inventory } from '../models/Inventory';
import { Lead } from '../models/Lead';
import { LoanApplication } from '../models/LoanApplication';
import { LoanApplicationRevision } from '../models/LoanApplicationRevision';
import { LoanApplicationActivity } from '../models/LoanApplicationActivity';
import { Offer } from '../models/Offer';
import { Quote } from '../models/Quote';
import { getWhereApplication } from '../utils/loanApplicationUtils';
import { checkLoanApp, prepareQitechDebtPayload } from '../lib/loanApplication4Qit';
import { newDebt } from '../providers/qitech';
import { LoanAppErrors } from '../interfaces/Item';
import _ from 'lodash';
import InternalError from '../exceptions/InternalError';
import { LoanApplicationDTO } from '../dto/LoanApplicationDTO';
import { GridQueryParser } from '../utils/GridQueryParser';
import { Account } from '../models/Account';
import { findSalesPersonBorges } from '../utils/accountUtils';
import { createSort } from '../utils/common';
import { LoanApplicationStatus } from '../models/LoanApplicationStatus';
import { LoanApplicationStatusReason } from '../models/LoanApplicationStatusReason';
import {
  getLoanAppOLD,
  cancelApplication,
  changeStatus,
  getApplication,
  saveApplication,
  createOrUpdateApplication,
  validateApplication,
  qiTechStatusCodeToLoanApplicationStatusCode,
  getLoanApplicationActivity,
  providerQitechUpdateStatus,
  getLoanApplicationProviderLogs,
} from '../lib/loanApplication';
import { Profile } from '../models/Profile';
import { changeInventoryStatus } from '../lib/inventory';
import { getAuthUserId } from '../utils/auth';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import { isEmpty, isNil } from 'lodash';
import BadRequestException from '../exceptions/BadRequestException';
import NotFoundException from '../exceptions/NotFoundException';
import ForbiddenException from '../exceptions/ForbiddenException';

const S3 = require('../providers/aws/s3');

class LoanApplicationController {
  async addFile(request: Request, response: Response, next: NextFunction) {
    const file: UploadedFile | undefined = request.files && (request.files['file'] as UploadedFile);
    if (!file) {
      return next(new FileArgumentMissingException());
    }

    try {
      const { id: applicationId } = request.params;
      if (!applicationId) {
        return next(new LoanApplicationArgumentMissingException());
      }
      const rta = await S3.upload(file.data, `${applicationId}_${file.name.replace(/\s+/g, '')}`);

      response.status(200).send({
        url: rta.url,
        name: rta.name, //`${applicationId}_${file.name.replace(/\s+/g, "")}`,
        md5hash: file.md5,
      });
    } catch (error) {
      console.log(error);
      return next(new FileUploadException());
    }
  }

  async get(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      const res = await getApplication(id);
      return response.json(res);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async getActivity(request: Request, response: Response, next: NextFunction) {
    const { loanApplicationId } = request.params;

    try {
      const activity = await getLoanApplicationActivity(loanApplicationId);
      return response.json(activity);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async providerLogs(request: Request, response: Response, next: NextFunction) {
    const { loanApplicationId } = request.params;

    try {
      const logs = await getLoanApplicationProviderLogs(loanApplicationId);
      return response.json(logs);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async getLoanLoanApplicationStatuses(request: Request, response: Response, next: NextFunction) {
    const { query } = request;
    let where = {};

    if (query.key && query.loanAppId) {
      where = {
        [Op.or]: [{ applicationKey: query.key }, { applicationKey: String(query.loanAppId) }],
      };
    } else {
      where = { applicationKey: String(query.loanAppId) };
    }

    try {
      const statuses = await LoanApplicationActivity.findAll({
        where,
        group: ['loanApplicationStatus'],
        order: [['createdAt', 'DESC']],
      });

      response.status(200).send(statuses);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async findByLeadId(request: Request, response: Response, next: NextFunction) {
    const { id = null }: { id?: number | null } = request.params;
    if (!id) {
      return next(new LoanApplicationArgumentMissingException());
    }

    try {
      const loanApplications = await LoanApplication.findAll({
        include: [
          {
            model: Lead,
            attributes: ['id'],
            include: [
              {
                model: Customer,
                attributes: ['firstName', 'lastName', 'citizenNumber'],
              },
            ],
          },
          {
            model: Inventory,
            attributes: [
              'id',
              'year',
              'assemblyYear',
              'vehiclePriceCurrency', // TODO: Check if the value is the same as fipeValuation "fipeValuation"
              'saleValuation',
              'vehicleBrandName',
              'vehicleModelName',
              'brand',
              'model',
            ],
          },
          {
            model: Offer,
            attributes: [['term', 'key']],
          },
        ],
        where: { leadId: id },
        order: [['id', 'asc']],
      });

      response.status(200).send(loanApplications);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async findAll(request: Request, response: Response, next: NextFunction) {
    request ?? request;

    try {
      const loanApplications = await LoanApplication.findAll({
        include: [
          {
            model: Lead,
            attributes: ['id'],
            include: [
              {
                model: Customer,
                attributes: ['firstName', 'lastName', 'citizenNumber'],
              },
            ],
          },
          {
            model: Inventory,
            attributes: [
              'id',
              'year',
              'assemblyYear',
              'vehiclePriceCurrency', // TODO: Check if the value is the same as fipeValuation "fipeValuation"
              'saleValuation',
              'brand',
              'model',
            ],
          },
          {
            model: Offer,
            attributes: [['term', 'key']],
          },
        ],
        order: [['id', 'asc']],
      });

      response.status(200).send(loanApplications);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async search(request: Request, response: Response, next: NextFunction) {
    const { authAccountId, authIsDealer } = request;
    const { sort, limit, page, filters } = GridQueryParser.parse(request.query);
    let where: any = getWhereApplication({
      filters,
      isDealer: authIsDealer,
      authAccountId,
    });

    try {
      const loanApplications = await LoanApplication.findAndCountAll({
        where: where,
        include: [
          {
            model: Lead,
            attributes: ['id', 'accountId', 'customerId'],
            include: [
              {
                model: Customer,
                attributes: ['firstName', 'lastName', 'citizenNumber'],
              },
              {
                model: Account,
                attributes: ['salesPersonBorges', 'name'],
              },
            ],
          },
          {
            model: Quote,
            attributes: [
              'customerAnalysisScore',
              'loanAnalysisDecision',
              'loanAnalysisResult',
              'loanMaxInstallmentAmount',
            ],
          },
          {
            model: Offer,
          },
          {
            model: Profile,
          },
          {
            model: Inventory,
          },
          {
            model: LoanApplicationStatus,
          },
          {
            model: LoanApplicationStatusReason,
          },
        ],
        offset: page ? (page - 1) * limit : undefined,
        limit: limit,
        raw: true,
        nest: true,
        order: createSort(sort),
      });

      const rta = {
        ...loanApplications,
        rows: loanApplications.rows.map(row => {
          return {
            ...row,
            lead: {
              ...row.lead,
              account: {
                ...row.lead.account,
                salesPersonBorges: findSalesPersonBorges(row.lead.account.salesPersonBorges),
              },
            },
          };
        }),
      };

      return response.status(200).send(rta);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  // current send to Qitech
  async providerSubmitApplication(request: Request, response: Response, next: NextFunction) {
    const { authProfileId, authAccountId } = request;
    const { id = null }: { id?: number | null } = request.params;

    if (!id) {
      return next(new LoanApplicationArgumentMissingException());
    }

    var loanApp: Partial<LoanApplicationDTO> | undefined;

    try {
      loanApp = await getLoanAppOLD(id);
    } catch (error) {
      return next(new InternalError(error));
    }
    if (!loanApp) {
      return next(new NotFoundException('Application not found'));
    }

    const validationErrors: Partial<LoanAppErrors> = await checkLoanApp(loanApp);

    if (_.isEmpty(validationErrors)) {
      const payload = await prepareQitechDebtPayload(loanApp);
      try {
        const qitResult = await newDebt(id, payload);

        // TODO REB check always?
        await LoanApplication.update({ externalKey: qitResult.qitechApplicationId }, { where: { id } });

        await changeStatus(id, {
          loanApplicationStatusCode: qiTechStatusCodeToLoanApplicationStatusCode(qitResult.statusCode),
          profileId: authProfileId,
          accountId: authAccountId,
        });

        const loanAppRes = await getApplication(id);

        return response.status(200).send(loanAppRes);
      } catch (error) {
        await changeStatus(id, {
          loanApplicationStatusCode: 'qit-contains_errors',
          data: {
            error,
            payload,
          },
          profileId: authProfileId,
          accountId: authAccountId,
        });

        return next(new InternalError('Eerro ao enviar para fornecedor'));
      }
    } else {
      await changeStatus(id, {
        loanApplicationStatusCode: 'panel-with-revisions',
        data: { validations: validationErrors },
        profileId: authProfileId,
        accountId: authAccountId,
      });
      return next(
        new BadRequestException('Precisa resolver algumas coisas antes de enviar para o fornecedor', {
          data: { validations: validationErrors },
        }),
      );
    }
  }

  async providerQitechUpdateApplication(request: Request, response: Response, next: NextFunction) {
    try {
      await providerQitechUpdateStatus(request.body);

      response.status(200).send('Ok');
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    const { offerId, quoteId } = request.body;
    const { authProfile } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }
    const userId = getAuthUserId(authProfile);

    try {
      const application = await createOrUpdateApplication({
        userId,
        offerId,
        quoteId,
      });
      response.status(200).send(application);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id;
    const { authProfileId, authAccountId } = request;

    try {
      const { person = {}, ...propsToUpdate } = request.body;
      await saveApplication({
        id,
        person,
        propsToUpdate,
        profileId: authProfileId,
        accountId: authAccountId,
      });
    } catch (error) {
      return next(new InternalError(error));
    }
    response.status(200).send({ message: 'OK' });
  }

  async cancel(request: Request, response: Response, next: NextFunction) {
    const id = request.params.id;
    const { reason } = request.body;
    try {
      await cancelApplication({ id, reason });
    } catch (error) {
      return next(new InternalError(error));
    }
    response.status(200).send({ message: 'OK' });
  }

  async createRevision(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    let { state = {} } = request.body;
    const { authProfileId, authIsDealer, authAccountId } = request;

    if (isEmpty(state)) {
      state = await LoanApplication.findByPk(id);
    }

    if (authIsDealer) {
      try {
        const validationErrors = await validateApplication(id);
        if (!isNil(validationErrors)) {
          await changeStatus(id, {
            loanApplicationStatusCode: 'with-revisions',
            profileId: authProfileId,
            accountId: authAccountId,
            data: {
              validations: validationErrors,
            },
          });

          return next(
            new BadRequestException('The application has some data validations left', {
              validations: validationErrors,
            }),
          );
        }

        const revision = await LoanApplicationRevision.create({
          userId: authProfileId,
          consumerLoanApplicationId: id,
          state,
        });
        if (!revision) {
          return next(new InternalError('Couldnt create revision'));
        }

        await changeStatus(id, {
          loanApplicationStatusCode: 'under-review',
          profileId: authProfileId,
          accountId: authAccountId,
        });

        const application = await getApplication(id);

        response.status(200).send(application);
      } catch (error) {
        return next(new InternalError(error));
      }
    } else {
      return next(new ForbiddenException('Only dealers can submit an application for review'));
    }
  }

  async replyRevision(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    const { authProfile, authIsPanel, authProfileId, authAccountId } = request;
    if (!authProfile) return next(new ProfileNotFoundException());
    const userId = getAuthUserId(authProfile);
    const revision = request.body;
    if (authIsPanel) {
      try {
        const revisions = await LoanApplicationRevision.findAll({
          where: {
            consumerLoanApplicationId: id,
          },
          order: [['id', 'DESC']],
        });
        const lastRevisionId = revisions[0].id;
        const responseAt = new Date();
        await LoanApplicationRevision.update(
          {
            responseType: revision.responseType,
            responseNotes: revision.responseNotes,
            responseAt,
            responseUserId: userId,
          },
          {
            where: {
              id: lastRevisionId, //always update last revision.
            },
          },
        );
        switch (revision.responseType) {
          case 'feedback':
            await changeStatus(id, {
              loanApplicationStatusCode: 'with-revisions',
              accountId: authAccountId,
              profileId: authProfileId,
              data: {
                feedback: revision.responseNotes,
              },
            });
            break;
          case 'rejected':
            await changeStatus(id, {
              loanApplicationStatusCode: 'rejected',
              accountId: authAccountId,
              profileId: authProfileId,
              data: {
                feedback: revision.responseNotes,
              },
            });
            const application = await LoanApplication.findByPk(id);
            application &&
              (await changeInventoryStatus({
                inventoryId: application.inventoryId,
                statusCode: 'published',
              }));
            break;
          case 'approved':
            await changeStatus(id, {
              loanApplicationStatusCode: 'approved',
              accountId: authAccountId,
              profileId: authProfileId,
              data: {
                feedback: revision.responseNotes,
              },
            });
            break;
          default:
            console.log('Non mapped feedback');
            break;
        }
        const applicationState = await getApplication(id);
        return response.status(200).send(applicationState);
      } catch (error) {
        return next(new InternalError(error));
      }
    }
  }

  async listStatus(request: Request, response: Response, next: NextFunction) {
    try {
      if (request.query && request.query.qt === 'select') {
        const status = await LoanApplicationStatus.findAll({
          raw: true,
          attributes: [
            ['id', 'value'],
            ['name', 'text'],
          ],
          order: [['name', 'asc']],
        });

        return response.json(status);
      }
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default LoanApplicationController;
