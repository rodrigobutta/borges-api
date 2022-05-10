import { NextFunction, Request, Response } from 'express';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { CHANNELS, INVENTORY_ACTIVITY_TYPE, INVENTORY_STATUS, QUOTE_STATUS } from '../constants';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import InternalError from '../exceptions/InternalError';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import { newInventoryActivity } from '../lib/inventoryActivity';
import { getLeadById } from '../lib/lead';
import { addLeadActivity } from '../lib/leadActivity';
import { doQuote } from '../lib/quote';
import { Account } from '../models/Account';
import { Customer } from '../models/Customer';
import { Inventory } from '../models/Inventory';
import { InventoryFile } from '../models/InventoryFile';
import { InventoryStatus } from '../models/InventoryStatus';
import { InventoryType } from '../models/InventoryType';
import { Lead } from '../models/Lead';
import { LoanApplication } from '../models/LoanApplication';
import { Location } from '../models/Location';
import { Offer } from '../models/Offer';
import { Quote } from '../models/Quote';
import { QuoteStatus } from '../models/QuoteStatus';
import { Profile } from '../models/Profile';
import { getWhereInventory } from '../utils/inventoryUtils';
import BadRequestException from '../exceptions/BadRequestException';

import { GridQueryParser } from '../helpers';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { getWhereLead, validateFieldsRequired } from '../utils/leadUtils';
import LeadException from '../exceptions/LeadException';
import { LeadActivity } from '../models/LeadActivity';
import { createSort } from '../utils/common';

class LeadController {
  async list(request: Request, response: Response, next: NextFunction) {
    const { qt } = request.query;

    if (qt === 'select') {
      try {
        const where = {
          accountId: request.authAccountId,
        };

        const leads = await Lead.findAll({
          attributes: ['id'],
          where,
          include: [
            {
              model: Customer,
              attributes: ['firstName', 'lastName'],
            },
          ],
        });

        return response.status(200).send(leads);
      } catch (error) {
        return next(new InternalError(error));
      }
    } else {
      const { authAccountId, authIsDealer } = request;
      const { sort, limit, page, filters } = GridQueryParser.parse(request.query);

      let where = getWhereLead({
        filters,
        isDealer: authIsDealer,
        authAccountId: String(authAccountId),
      });

      try {
        const body = await Lead.findAndCountAll({
          include: [
            {
              model: Account,
              attributes: ['name'],
            },
            {
              model: Profile,
              // where: userWhere,
              as: 'firstInteractionUser',
              attributes: ['firstName', 'lastName'],
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [
                'firstName',
                'lastName',
                'cpf',
                'citizenNumber',
                'email',
                'phoneNumber',
                'customerFulfillmentStatusId',
              ],
              include: [
                {
                  model: CustomerAnalysis,
                  as: 'analysis',
                },
              ],
              // where: customerWhere,
            },
          ],
          where: where,
          offset: page ? (Number(page) - 1) * Number(limit) : undefined,
          limit: Number(limit),
          raw: true,
          order: createSort(sort),
        });
        return response.status(200).send(body);
      } catch (e) {
        return next(new LeadException());
      }
    }
  }

  async get(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    try {
      const lead = await getLeadById(id);
      if (!lead) {
        return next(new LeadNotFoundException());
      }

      return response.status(200).json(lead);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async findByCitizenNumber(request: Request, response: Response, next: NextFunction) {
    const { citizenNumber } = request.body;

    try {
      const lead = await Lead.findOne({
        include: [
          {
            model: Customer,
            where: {
              citizenNumber,
            },
          },
        ],
      });
      if (!lead) {
        return next(new LeadNotFoundException());
      }

      return response.status(200).send(lead);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async search(request: Request, response: Response, next: NextFunction) {
    const { authAccountId, authIsDealer } = request;
    const { sort, limit, page, filters } = GridQueryParser.parse(request.query);

    let where = getWhereLead({
      filters,
      isDealer: authIsDealer,
      authAccountId: String(authAccountId),
    });

    try {
      const body = await Lead.findAndCountAll({
        include: [
          {
            model: Account,
            attributes: ['name'],
          },
          {
            model: Profile,
            // where: userWhere,
            as: 'firstInteractionUser',
            attributes: ['firstName', 'lastName'],
          },
          {
            model: Customer,
            as: 'customer',
            attributes: [
              'firstName',
              'lastName',
              'citizenNumber',
              'email',
              'phoneNumber',
              'customerFulfillmentStatusId',
            ],
            include: [
              {
                model: CustomerAnalysis,
                as: 'analysis',
              },
            ],
            // where: customerWhere,
          },
        ],
        where: where,
        offset: page ? (Number(page) - 1) * Number(limit) : undefined,
        limit: Number(limit),
        raw: true,
        order: createSort(sort),
      });
      return response.status(200).send(body);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async searchInventory(request: Request, response: Response, _next: NextFunction) {
    const { authAccountId, authIsDealer } = request;

    const { id } = request.params;
    const { page, filters, sort } = request.body;
    sort as string;

    const { state, city } = filters;
    let where: any = getWhereInventory({
      filters: filters,
      pLeadId: parseInt(id),
      isDealer: authIsDealer,
      authAccountId: authAccountId,
    });
    // where["accountId"] = { [Op.eq]: authAccountId };
    where['inactive'] = { [Op.eq]: null };
    where['sold'] = { [Op.eq]: null };
    where['inventoryStatusId'] = { [Op.eq]: INVENTORY_STATUS['published'] };

    let whereLocation: any = {};

    if (state) {
      whereLocation['state'] = state;
    }
    if (city) {
      whereLocation['city'] = city;
    }

    const body = await Inventory.findAll({
      attributes: [
        'id',
        'accountId',
        'year',
        'assemblyYear',
        'saleValuation',
        'mileage',
        'inactive',
        'sold',
        'type',
        'customerId',
        'vehicleConditionId',
        'vehicleConditionName',
        'vehicleBrandName',
        'vehicleFamilyName',
        'vehicleModelName',
        'vehicleMadeInName',
        'vehicleFuelName',
        'vehicleYear',
        'vehiclePriceAmount',
        'borgesPrice',
        'vehiclePriceCurrency',
        'imageCover',
        'imageExteriorFront',
        'imageExteriorBack',
        'imageExteriorLeft',
        'imageExteriorRight',
        'imageInteriorFront',
        'imageInteriorBack',
        'imageInteriorDashboard',
        'imageInteriorTrunk',
        'imageOther1',
        'imageOther2',
        'imageOther3',
        'createdAt',
      ],
      include: [
        {
          model: Account,
        },
        {
          model: Location,
          where: whereLocation,
        },
        {
          model: InventoryFile, // TODO remove after all images and docs are stored in new format
        },
        {
          model: InventoryType,
        },
        {
          model: InventoryStatus,
          where: {
            searchable: 1,
          },
        },
      ],
      where: where,
      offset: page ? (page - 1) * 50 : 0,
      limit: 50,
      raw: true,
      nest: true,
      order: createSort(!!sort ? [(sort as string).split('+')] : null),
    });

    return response.status(200).json({ rows: body, count: body.length });
  }

  async getQuotesByLeadId(request: Request, response: Response, next: NextFunction) {
    const { id } = request.params;

    let conditions: Map<string, any> = new Map();
    conditions.set('$lead.id$', { [Op.eq]: id });
    conditions.set('quoteInstanceId', {
      [Op.or]: {
        [Op.is]: null,
        [Op.ne]: QUOTE_STATUS['canceled'],
        [Op.notIn]: [
          QUOTE_STATUS['canceled'],
          QUOTE_STATUS['not-interested-anymore'],
          QUOTE_STATUS['not-interested-installment-amount'],
          QUOTE_STATUS['not-interested-loan-amount'],
          QUOTE_STATUS['not-interested-vehicle-bad-status'],
        ],
      },
    });
    const where: WhereOptions = Sequelize.and(Object.fromEntries(conditions));

    try {
      const quotes = await Quote.findAll({
        include: [
          {
            model: Lead,
            include: [
              {
                model: Customer,
                attributes: ['firstName', 'lastName'],
              },
            ],
          },
          {
            model: Inventory,
            include: [{ model: InventoryFile, attributes: ['url', 'name'] }],
          },
          {
            model: QuoteStatus,
          },
          {
            model: Offer,
          },
          {
            model: Profile,
            attributes: ['firstName', 'lastName'],
          },
          {
            model: LoanApplication,
            attributes: ['id', 'status'],
          },
        ],
        where: where,
        nest: true,
      });

      return response.json(quotes);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async createStockQuote(request: Request, response: Response, next: NextFunction) {
    const {
      inventoryId,
      channel = CHANNELS['consumer-web'],
      interest = 3,
      declaredIncome,
      jobType,
      leadId,
      cosignerCustomerId = null,
      cosignerCitizenNumber = null,
      cosignerJobType = null,
      cosignerDeclaredIncome = null,
      amount = null,
      includeExpenses = null,
      gravamenStateCode: pGravamenStateCode,
      commissionId = 0,
    } = request.body;

    let finalCosignerCitizenNumber = cosignerCitizenNumber;
    if (cosignerCustomerId) {
      const cosigner = await Customer.findOne({
        where: {
          id: cosignerCustomerId,
        },
      });
      if (!cosigner) {
        throw new CustomerNotFoundException('Avalista não encontrado');
      }
      finalCosignerCitizenNumber = cosigner.citizenNumber;
    }

    const { authProfileId, authAccountId, authProfile, authIsDealer } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const lead = await Lead.findByPk(leadId, {
      include: [{ model: Customer }, { model: Account }],
      nest: true,
      raw: true,
    });

    if (!lead) {
      return next(new LeadNotFoundException());
    }

    const gravamenStateCode = pGravamenStateCode;

    await addLeadActivity({
      accountId: authAccountId,
      leadId,
      typeCode: 'user-creates-quote',
      profileId: authProfileId,
      data: {
        inventoryId,
      },
      client: request.authClient,
    });

    await newInventoryActivity({
      accountId: authAccountId,
      inventoryId,
      activityTypeId: INVENTORY_ACTIVITY_TYPE['quote-created'],
      userId: authProfileId,
    });

    try {
      const quote = await doQuote({
        inventoryId,
        user: authProfile,
        leadId,
        channel,
        interest,
        pJobType: jobType,
        pDeclaredIncome: declaredIncome,
        accountId: authAccountId,
        cosignerCitizenNumber: finalCosignerCitizenNumber,
        cosignerJobType,
        cosignerDeclaredIncome,
        pAmount: amount,
        includeExpenses,
        pGravamenStateCode: gravamenStateCode,
        commissionId,
        isDealer: authIsDealer,
      });

      return response.json(quote);
    } catch (error) {
      return next(new InternalError(error));
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    const { authAccountId, authProfileId, body } = request;

    const now = new Date();

    const {
      cpf, // TODO change to document
      citizenNumber,
      email,
      firstName,
      jobType = 1,
      declaredIncome,
      lastName,
      phoneNumber,
      stateCode,
      origin = null,
      idFrontImage,
      idBackImage,
      addressCertificate,
      incomeCertificate,
      auxiliaryDocument1,
      auxiliaryDocument2,
    } = body;
    try {
      validateFieldsRequired(body);
      await Customer.upsert({
        citizenNumber: cpf || citizenNumber,
        email,
        firstName,
        jobType,
        declaredIncome,
        lastName,
        phoneNumber,
        stateCode,
        idFrontImage,
        idBackImage,
        addressCertificate,
        incomeCertificate,
        auxiliaryDocument1,
        auxiliaryDocument2,
      });

      const customer = await Customer.findOne({
        where: {
          citizenNumber: cpf || citizenNumber,
        },
        raw: true,
        nest: true,
      });

      if (!customer) {
        return next(new CustomerNotFoundException());
      }

      const [lead, wasCreated] = await Lead.findOrCreate({
        where: {
          customerId: customer.id,
          accountId: authAccountId,
        },
        defaults: {
          userId: authProfileId,
          origin,
        },
      });

      await Lead.update(
        {
          lastInteractionAt: now,
          lastInteractionUserId: authProfileId,
          lastInteractionOrigin: origin,
        },
        {
          where: {
            id: lead.id,
          },
        },
      );

      await LeadActivity.create({
        leadId: lead.id,
        leadActivityTypeId: 1, // TODO keycloak logic to determine origin
        userId: authProfileId,
        accountId: authAccountId,
        // description,
        // data,
      });

      const leadWithScore = await getLeadById(lead.id);
      if (!leadWithScore) {
        response.status(200).send(lead);
        // res.status(404).send("Could not calculate score for lead.");
      }

      response.status(200).send({
        ...leadWithScore,
        returningCustomer: !wasCreated,
      });
    } catch (e: any) {
      console.log(e);
      if (e.name === 'SequelizeValidationError') {
        return next(new InternalError('Validation errors: ' + e.errors.map((x: any) => x.path.split('-'))));
      } else {
        return next(new InternalError(e));
      }
    }
  }

  async addInteraction(request: Request, response: Response, next: NextFunction) {
    const { authProfileId, authAccountId } = request;
    const { leadId } = request.params;
    const { channelId, comments } = request.body;

    if (!channelId) {
      return next(new BadRequestException('Channel ID not present'));
    }

    try {
      const lead = await getLeadById(leadId);
      if (!lead) {
        return next(new LeadNotFoundException());
      }

      const activity = await addLeadActivity({
        accountId: authAccountId,
        profileId: authProfileId,
        leadId,
        typeCode: 'interaction',
        data: {
          channelId,
          comments,
        },
        client: request.authClient,
        authProfileId,
      });

      return response.status(200).json(activity);
    } catch (error) {
      return next(new InternalError(error));
    }
  }
}

export default LeadController;
