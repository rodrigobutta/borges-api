import { NextFunction, Request, Response } from 'express';
import { pick } from 'lodash';
import { Customer } from '../models/Customer';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import CustomerUpdateException from '../exceptions/CustomerUpdateException';
import { Lead } from '../models/Lead';
import {
  calcCustomerFulfillmentStatus,
  getCustomerById,
  customerByCpf,
  checkCustomerByEmail,
  clearCustomerAnalysisCache,
} from '../lib/customer'; // pruebasApiBot add customerByCpf
import { Quote } from '../models/Quote';
import { Inventory } from '../models/Inventory';
import { Location } from '../models/Location';
import { Status } from '../models/Status';
import { CustomerAnalysisLog } from '../models/CustomerAnalysisLog';
import { addLeadActivity } from '../lib/leadActivity';
import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import { LeadActivity } from '../models/LeadActivity';
import { LeadActivityType } from '../models/LeadActivityType';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import BadRequestException from '../exceptions/BadRequestException';
import { Account } from '../models/Account';
import { Profile } from '../models/Profile';
import { InventoryType } from '../models/InventoryType';
import { CHANNELS, CONSUMER_ACCOUNT_ID, INVENTORY_ACTIVITY_TYPE, INVENTORY_TYPE } from '../constants';
import InventoryException from '../exceptions/InventoryException';
import { newInventoryActivity } from '../lib/inventoryActivity';
import { INVENTORY_STATUS, GENERIC_VEHICLE_COVERS } from '../constants';
import QuoteException from '../exceptions/QuoteException';
import { changeStatus, doQuote } from '../lib/quote';
import { InventoryStatus } from '../models/InventoryStatus';
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import QuoteNotFoundException from '../exceptions/QuoteNotFoundException';
import { LoanApplication } from '../models/LoanApplication';
import { QuoteStatus } from '../models/QuoteStatus';
import InternalError from '../exceptions/InternalError';
import { borgesPricer } from '../utils/borgesPricer';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { GridQueryParser } from '../helpers';
import { getWhereCustomer } from '../utils/customerUtils';
import { Client } from '../models/Client';

class CustomerController {
  async get(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const customer = await getCustomerById(customerId);
      if (!customer) {
        return next(new CustomerNotFoundException());
      }

      return response.status(200).send(customer);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async getById(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.id;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const customer = await getCustomerById(customerId);
      if (!customer) {
        return next(new CustomerNotFoundException());
      }

      return response.status(200).send(customer);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async getQuotes(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    let conditions: Map<string, any> = new Map();
    conditions.set('$lead.customerId$', { [Op.eq]: customerId });
    conditions.set('quoteInstanceId', {
      [Op.or]: {
        [Op.is]: null,
        [Op.notIn]: Sequelize.literal(`(Select qi.id from quoteInstances qi where qi.code like 'not-interested%')`),
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
                attributes: [],
              },
            ],
          },
          {
            model: Inventory,
          },
          {
            model: QuoteStatus,
            attributes: ['id', 'code', 'name', 'data', 'locked'],
          },
          {
            model: LoanApplication,
            attributes: ['id', 'status'],
          },
        ],
        where: where,
        raw: true,
        nest: true,
      });

      return response.json(quotes);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async getActivity(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const activity = await LeadActivity.findAll({
        attributes: ['id', 'description', 'data', 'createdAt'],
        include: [
          {
            model: Lead,
            attributes: ['id', 'origin', 'customerId'],
            include: [
              {
                model: Customer,
                attributes: [],
              },
            ],
          },
          {
            model: LeadActivityType,
            attributes: ['id', 'code', 'name'],
          },
          {
            model: Account,
            attributes: ['id', 'name'],
          },
          {
            model: Profile,
            attributes: ['id', 'uuid', 'email', 'firstName', 'lastName'],
          },
          {
            model: Client,
            attributes: ['id', 'name'],
          },
        ],
        where: {
          '$lead.customerId$': customerId,
        },
        order: [['id', 'DESC']],
        raw: true,
        nest: true,
      });

      return response.json(activity);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async patch(request: Request, response: Response, next: NextFunction) {
    const { authProfileId } = request;
    if (!authProfileId) {
      return next(new ProfileNotFoundException());
    }

    const { customerId } = request.params;

    // only update present fields in the body that are the ones available to update
    const updatingFields = pick(request.body, [
      'firstName',
      'lastName',
      'jobType',
      'phoneNumber',
      'stateCode',
      'declaredIncome',
      'idFrontImage',
      'idBackImage',
      'addressCertificate',
      'incomeCertificate',
    ]);

    try {
      await Customer.update(
        {
          ...updatingFields,
        },
        {
          where: {
            id: customerId,
          },
        },
      );

      const tmpCustomer = await Customer.findByPk(customerId, {
        raw: true,
        nest: true,
      });
      if (!tmpCustomer) {
        return next(new CustomerUpdateException());
      }

      const fulfillmentStatus = calcCustomerFulfillmentStatus(tmpCustomer);
      await Customer.update(
        {
          customerFulfillmentStatusId: fulfillmentStatus,
        },
        {
          where: {
            id: customerId,
          },
        },
      );

      // Reset the Analysis cache since the jobType is being updated
      if (updatingFields.jobType || updatingFields.declaredIncome) {
        await clearCustomerAnalysisCache(customerId);
      }

      await addLeadActivity({
        customerId,
        typeCode: 'customer-update-information',
        profileId: authProfileId,
        data: {
          updatingFields,
        },
        client: request.authClient,
      });

      // if(1===1) return response.send("Ok")

      if (fulfillmentStatus === 3) {
        await addLeadActivity({
          customerId,
          typeCode: 'customer-fulfillment-complete',
          profileId: authProfileId,
          client: request.authClient,
        });
      }

      const customer = await getCustomerById(customerId);
      if (!customer) {
        return next(new CustomerNotFoundException());
      }

      return response.json(customer);
    } catch (error) {
      console.log(error);
      return next(new CustomerUpdateException());
    }
  }

  async getAnalysisLogs(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const logs = await CustomerAnalysisLog.findAll({
        where: {
          customerId,
        },
        raw: true,
        nest: true,
        order: [['id', 'DESC']],
      });

      return response.json(logs);
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async getAnalysisScore(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('Customer ID could not be retrieved'));
    }

    try {
      if (request.query.refreshCache) {
        await clearCustomerAnalysisCache(customerId);
        await getCustomerById(customerId);
      }
      const analysis = await CustomerAnalysis.findOne({
        where: {
          customerId,
        },
        raw: true,
      });
      return response.json(analysis?.score);
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async getInventory(request: Request, response: Response, next: NextFunction) {
    const customerId = request.params.customerId || request.authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const logs = await Inventory.findAll({
        include: [
          {
            model: InventoryType,
            attributes: ['id', 'code', 'name'],
          },
          {
            model: InventoryStatus,
            attributes: ['id', 'code', 'name'],
          },
        ],
        where: {
          customerId,
        },
        raw: true,
        nest: true,
      });

      return response.json(logs);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async createInventory(request: Request, response: Response, next: NextFunction) {
    const { authProfileId, authCustomerId } = request;
    if (!authProfileId) {
      // preguntar por el authAccountid
      return next(new ProfileNotFoundException());
    }

    const customerId = parseInt(request.params.customerId) || authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      // TODO check why using pick. Can not create a newInventory object cause of dynamic types.
      // const objectFields = pick(request.body, [
      //   'licensePlate',
      //   'makerCountry',
      //   'year',
      //   'assemblyYear',
      //   'saleValuation',
      //   'mileage',
      //   'brand',
      //   'color',
      //   'model',
      //   'type',
      //   'vin',
      //   'floorPlanStatus',
      //   'bancarizadorStatus',
      //   'renavam',
      //   'inactive',
      //   'sold',
      //   'new',
      //   'vehicleConditionId',
      //   'vehicleConditionName',
      //   'vehicleClasificationId',
      //   'vehicleClasificationName',
      //   'vehicleBrandId',
      //   'vehicleBrandName',
      //   'vehicleFamilyId',
      //   'vehicleFamilyName',
      //   'vehicleModelId',
      //   'vehicleModelName',
      //   'vehicleMadeInId',
      //   'vehicleMadeInName',
      //   'vehicleFuelId',
      //   'vehicleFuelName',
      //   'vehicleYear',
      //   'vehiclePriceAmount',
      //   'vehiclePriceCurrency',
      //   'vehicleParameters',
      //   'imageCover',
      //   'imageExteriorFront',
      //   'imageExteriorBack',
      //   'imageExteriorLeft',
      //   'imageExteriorRight',
      //   'imageInteriorFront',
      //   'imageInteriorBack',
      //   'imageInteriorDashboard',
      //   'imageInteriorTrunk',
      //   'imageOther1',
      //   'imageOther2',
      //   'imageOther3',
      //   'certificatePlate',
      //   'certificateVerification',
      //   'locationId',
      //   'vehicleGeneralConditionId'
      // ]);

      // TODO TMP to fill old code crap
      // const status = await models.status.findOne({
      //   where: { accountId },
      // });

      const newInventory: Inventory = {
        ...request.body,
        accountId: CONSUMER_ACCOUNT_ID, // tomarlo del profile
        userId: authProfileId,
        customerId,
        inventoryStatusId: INVENTORY_STATUS['pending-approval'],
        inventoryTypeId: INVENTORY_TYPE['private-stock'],
        statusId: 1, // TODO tmp to avoid old status problems
      };

      /*       if (newInventory.vehiclePriceCurrency && newInventory.vehiclePriceCurrency.toUpperCase() !== CURRENCIES['USD']) {
        const priceInUSD = await convert(
          newInventory.vehiclePriceCurrency,
          CURRENCIES["USD"],
          newInventory.vehiclePriceAmount
        );
        if (priceInUSD) {
          newInventory.vehiclePriceAmount = priceInUSD;
          newInventory.vehiclePriceCurrency = CURRENCIES["USD"];
        }
      } */

      const borgesPrice = await borgesPricer({ inventory: newInventory });
      newInventory.borgesPrice = borgesPrice;

      const record = await Inventory.create(newInventory);

      // const inventory = await Inventory.create({
      //   ...objectFields,
      //   userId: authProfileId,
      //   customerId,
      //   accountId: CONSUMER_ACCOUNT_ID,
      // });

      await addLeadActivity({
        accountId: CONSUMER_ACCOUNT_ID,
        customerId,
        typeCode: 'consumer-inventory-add-request',
        profileId: authProfileId,
        data: {
          inventoryId: record.id,
        },
        client: request.authClient,
      });

      await newInventoryActivity({
        accountId: CONSUMER_ACCOUNT_ID,
        inventoryId: record.id,
        activityTypeId: INVENTORY_ACTIVITY_TYPE['added-with-pendent-request'],
        userId: authProfileId,
      });

      return response.json(record);
    } catch (error) {
      console.log(error);
      return next(new InventoryException());
    }
  }

  async createStockQuote(request: Request, response: Response, next: NextFunction) {
    const {
      inventoryId,
      channel = CHANNELS['consumer-web'],
      interest = 3,
      accountId = CONSUMER_ACCOUNT_ID,
      cosignerCitizenNumber = null,
      cosignerJobType = null,
      cosignerDeclaredIncome = null,
      amount = null,
      includeExpenses = null,
    } = request.body;

    const { authProfileId, authProfile, authCustomerId, authIsDealer } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const customerId = request.params.customerId || authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada.'));
    }

    await addLeadActivity({
      accountId,
      customerId,
      typeCode: 'user-creates-quote',
      profileId: authProfileId,
      data: {
        inventoryId,
      },
      client: request.authClient,
    });

    await newInventoryActivity({
      accountId,
      inventoryId,
      activityTypeId: INVENTORY_ACTIVITY_TYPE['quote-created'],
      userId: authProfileId,
    });

    try {
      const quote = await doQuote({
        inventoryId,
        user: authProfile,
        channel,
        interest,
        accountId,
        cosignerCitizenNumber,
        cosignerJobType,
        cosignerDeclaredIncome,
        pAmount: amount,
        includeExpenses,
        isDealer: authIsDealer,
      });

      return response.json(quote);
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async createVirtualQuote(request: Request, response: Response, next: NextFunction) {
    const idFields = pick(request.body, ['leadId']);

    let lead;
    let channel = CHANNELS['consumer-web'];
    let inventoryTypeId = INVENTORY_TYPE['private-virtual'];
    if (idFields.leadId) {
      lead = await Lead.findByPk(idFields.leadId);
      channel = CHANNELS['dealers-web'];
      inventoryTypeId = INVENTORY_TYPE['dealer-virtual'];
    }

    const { authAccountId, authProfileId, authProfile, authIsDealer, authCustomerId } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const customerId = request.params.customerId || authCustomerId || lead?.customerId;
    const accountId = authAccountId || lead?.accountId;

    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada.'));
    }

    try {
      const objectFields = pick(request.body, [
        'new',
        'vehicleConditionId',
        'vehicleConditionName',
        'vehicleClasificationId',
        'vehicleClasificationName',
        'vehicleBrandId',
        'vehicleBrandName',
        'vehicleFamilyId',
        'vehicleFamilyName',
        'vehicleModelId',
        'vehicleModelName',
        'vehicleMadeInId',
        'vehicleMadeInName',
        'vehicleFuelId',
        'vehicleFuelName',
        'vehicleYear',
        'vehiclePriceAmount',
        'vehiclePriceCurrency',
        'vehicleParameters',
        'type',
      ]);

      let genericCarImageCover;
      switch (objectFields.type) {
        case 'Coupe':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['coupe'];
          break;
        case 'Sedane':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['sedane'];
          break;
        case 'PickUp':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['pickUp'];
          break;
        case 'SUV':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['suv'];
          break;
        case 'Hatch':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['hatch'];
          break;
        default:
          genericCarImageCover = GENERIC_VEHICLE_COVERS['coupe'];
          break;
      }

      const inventory = await Inventory.create({
        ...objectFields,
        assemblyYear: objectFields['vehicleYear'],
        year: objectFields['vehicleYear'],
        new: objectFields['new'],
        userId: authProfileId,
        customerId,
        vehicleBrandName: 'genericCar',
        imageCover: genericCarImageCover,
        saleValuation: objectFields.vehiclePriceAmount,
        accountId: accountId || CONSUMER_ACCOUNT_ID,
        inventoryStatusId: INVENTORY_STATUS['published'],
        inventoryTypeId: inventoryTypeId, // INVENTORY_TYPE['simulation'],
        statusId: 1, // TODO tmp to avoid old status problems
        locationId: 1, // TODO tmp to avoid old location problems
      });

      try {
        const quote = await doQuote({
          inventoryId: inventory.id,
          user: authProfile,
          leadId: lead?.id,
          channel, // TODO get real
          interest: 3,
          accountId: accountId || CONSUMER_ACCOUNT_ID,
          isDealer: authIsDealer,
        });

        return response.json(quote);
      } catch (error) {
        console.log(error);
        return next(new InternalError(error));
      }
    } catch (error) {
      console.log(error);
      return next(new InventoryException());
    }
  }

  async createSimulationQuote(request: Request, response: Response, next: NextFunction) {
    const idFields = pick(request.body, ['leadId']);

    let lead;
    let channel = CHANNELS['consumer-web'];
    if (idFields.leadId) {
      lead = await Lead.findByPk(idFields.leadId);
      channel = CHANNELS['dealers-web'];
    }

    const { authAccountId, authProfileId, authProfile, authIsDealer, authCustomerId } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const customerId = request.params.customerId || authCustomerId || lead?.customerId;
    const accountId = authAccountId || lead?.accountId;

    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada.'));
    }

    try {
      const objectFields = pick(request.body, ['vehiclePriceAmount', 'vehiclePriceCurrency', 'vehicleYear', 'type']);

      let genericCarImageCover;
      switch (objectFields.type) {
        case 'Coupe':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['coupe'];
          break;
        case 'Sedane':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['sedane'];
          break;
        case 'PickUp':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['pickUp'];
          break;
        case 'SUV':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['suv'];
          break;
        case 'Hatch':
          genericCarImageCover = GENERIC_VEHICLE_COVERS['hatch'];
          break;
        default:
          genericCarImageCover = GENERIC_VEHICLE_COVERS['coupe'];
          break;
      }

      const currentYear = new Date().getFullYear();
      const isNew = objectFields.vehicleYear === currentYear ? 1 : 0;

      const inventory = await Inventory.create({
        ...objectFields,
        assemblyYear: objectFields['vehicleYear'],
        year: objectFields['vehicleYear'],
        new: isNew,
        userId: authProfileId,
        customerId,
        vehicleBrandName: 'genericCar',
        imageCover: genericCarImageCover,
        saleValuation: objectFields.vehiclePriceAmount,
        accountId: accountId || CONSUMER_ACCOUNT_ID,
        inventoryStatusId: INVENTORY_STATUS['published'],
        inventoryTypeId: INVENTORY_TYPE['simulation'],
        statusId: 1, // TODO tmp to avoid old status problems
        locationId: 1, // TODO tmp to avoid old location problems
      });

      try {
        /***
         * TODO GravamenStateCode is required. Check how to get it.
         */

        const quote = await doQuote({
          inventoryId: inventory.id,
          user: authProfile,
          leadId: lead?.id,
          channel,
          interest: 3,
          accountId: accountId || CONSUMER_ACCOUNT_ID,
          isDealer: authIsDealer,
        });

        return response.json(quote);
      } catch (error) {
        console.log(error);
        return next(new QuoteException());
      }
    } catch (error) {
      console.log(error);
      return next(new InventoryException());
    }
  }

  async recalculateQuote(request: Request, response: Response, next: NextFunction) {
    const {
      quoteId,
      channel = CHANNELS['consumer-web'],
      accountId = CONSUMER_ACCOUNT_ID,
      // requestedAmount = null // TODO use it or not, check recalculate flow definitions
    } = request.body;

    const { authProfileId, authIsDealer, authProfile } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const quoteFetched = await Quote.findOne({
      where: {
        id: quoteId,
      },
    });
    if (!quoteFetched) {
      return next(new QuoteNotFoundException());
    }

    const leadId = quoteFetched.leadId;
    const inventoryId = quoteFetched.inventoryId;

    await changeStatus({
      quoteId,
      quoteStatusCode: 'analysis-requested',
      userId: authProfileId,
      accountId,
      data: {
        recalculating: true,
      },
    });

    try {
      const quote = await doQuote({
        inventoryId: inventoryId,
        leadId,
        pGravamenStateCode: quoteFetched.gravamenStateCode,
        user: authProfile,
        channel,
        accountId,
        isDealer: authIsDealer,
      });

      return response.json(quote);
    } catch (error) {
      console.log(error);
      return next(new InternalError(error));
    }
  }

  async createMLStockQuote(request: Request, response: Response, next: NextFunction) {
    const { authProfileId, authCustomerId, authIsDealer, authProfile } = request;
    if (!authProfile) {
      return next(new ProfileNotFoundException());
    }

    const customerId = request.params.customerId || authCustomerId;
    if (!customerId) {
      // TODO add role check for retrieving any customerID
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    try {
      const objectFields = pick(request.body, [
        'new',
        'vehicleConditionId',
        'vehicleConditionName',
        'vehicleClasificationId',
        'vehicleClasificationName',
        'vehicleBrandId',
        'vehicleBrandName',
        'vehicleFamilyId',
        'vehicleFamilyName',
        'vehicleModelId',
        'vehicleModelName',
        'vehicleMadeInId',
        'vehicleMadeInName',
        'vehicleFuelId',
        'vehicleFuelName',
        'vehicleYear',
        'vehiclePriceAmount',
        'vehiclePriceCurrency',
        'vehicleParameters',
        'imageCover',
        'mileage',
        'saleValuation',
        'mlInventoryId',
        'mlSellerId',
        'mlSellerName',
        'location',
      ]);

      let account = await Account.findOne({
        where: {
          mlSellerId: objectFields.mlSellerId,
        },
      });

      if (!account) {
        account = await Account.create({
          name: objectFields.mlSellerName,
          mlSellerId: objectFields.mlSellerId,
        });
        // TODO remove this status
        await Status.bulkCreate([
          {
            name: 'Disponivel',
            accountId: account.id,
            color: '#33691e',
          },
          {
            name: 'Reservado',
            accountId: account.id,
            color: '#795548',
          },
          {
            name: 'Bloqueado',
            accountId: account.id,
            color: '#01579b',
          },
          {
            name: 'Em preparação',
            accountId: account.id,
            color: '#004d40',
          },
          {
            name: 'Em trânsito',
            accountId: account.id,
            color: '#827717',
          },
          {
            name: 'Vendido',
            accountId: account.id,
            color: '#4a148c',
          },
        ]);
      }

      let location = await Location.findOne({
        where: {
          accountId: account.id,
        },
      });

      if (!location) {
        location = await Location.create({
          name: objectFields.mlSellerName + '-Principal',
          accountId: account.id,
          zipCode: objectFields.location?.zipCode,
          lat: objectFields.location?.lat,
          lng: objectFields.location?.lng,
          isPointOfSale: true,
        });
      }

      let lead = await Lead.findOne({
        where: {
          [Op.and]: [{ accountId: account.id }, { customerId: customerId }],
        },
      });

      if (!lead) {
        lead = await Lead.create({
          origin: 'consumer',
          accountId: account.id,
          userId: authProfileId,
          customerId: customerId,
        });
      }

      delete objectFields['mlSellerName']; //Dont need seller name for creating inventory.
      delete objectFields['location'];
      let inventory = await Inventory.findOne({
        where: {
          mlInventoryId: objectFields.mlInventoryId,
        },
      });

      if (!inventory) {
        inventory = await Inventory.create({
          ...objectFields,
          saleValuation: objectFields.saleValuation, // TODO 80% of ML published price until logic is decided.
          userId: authProfileId,
          customerId,
          accountId: account.id,
          inventoryStatusId: INVENTORY_STATUS['published'],
          inventoryTypeId: INVENTORY_TYPE['external-mercadolibre'],
          statusId: 1, // TODO tmp to avoid old status problems
          locationId: location?.id, // TODO tmp to avoid old location problems
          mlInventoryId: objectFields.mlInventoryId,
          mlSellerId: objectFields.mlSellerId,
        });
      }

      await addLeadActivity({
        accountId: CONSUMER_ACCOUNT_ID,
        customerId,
        typeCode: 'user-creates-quote',
        profileId: authProfileId,
        data: {
          inventoryId: inventory.id,
        },
        client: request.authClient,
      });

      await newInventoryActivity({
        accountId: CONSUMER_ACCOUNT_ID,
        inventoryId: inventory.id,
        activityTypeId: INVENTORY_ACTIVITY_TYPE['quote-created'],
        userId: authProfileId,
      });

      try {
        const quote = await doQuote({
          inventoryId: inventory.id,
          user: authProfile,
          channel: CHANNELS['consumer-web'], // TODO get real
          interest: 3,
          accountId: account.id,
          isDealer: authIsDealer,
        });
        return response.status(200).send(quote);
      } catch (error) {
        console.log(error);
        return next(new QuoteException());
      }
    } catch (error) {
      console.log(error);
      return next(new InventoryException());
    }
  }

  // pruebasApiBot
  async getAllTheRest(request: Request, response: Response) {
    try {
      const { search, customerId } = request.query;

      const customer = await Customer.findByPk(customerId as string);
      if (!customer) {
        return response.status(400).send('Cosigner customer not found');
      }

      const result = await Customer.findAll({
        attributes: ['firstName', 'lastName', 'citizenNumber', 'id'],
        where: {
          [Op.or]: [
            {
              firstName: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastName: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              citizenNumber: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
          [Op.and]: [
            {
              id: {
                [Op.ne]: customer.id,
              },
            },
          ],
        },
        order: [['lastName', 'asc']],
      });
      return response.status(200).send(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }

  //pruebasApiBot
  async isCustomerByEmail(request: Request, response: Response, next: NextFunction) {
    const { customerEmail } = request.params;
    try {
      const customer = await checkCustomerByEmail(customerEmail);
      if (!customer) {
        return next(new CustomerNotFoundException());
      }
      return response.status(200).send(customer);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  //ApiBot
  async getByCpf(request: Request, response: Response, next: NextFunction) {
    const { customerCpf } = request.params;

    try {
      const customer = await customerByCpf(customerCpf);
      if (!customer) {
        return next(new CustomerNotFoundException());
      }

      return response.status(200).send(customer);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async findAll(request: Request, response: Response) {
    const { filters } = GridQueryParser.parse(request.query);
    const { authAccountId, authIsDealer } = request;

    try {
      const where = await getWhereCustomer({
        filters,
        authAccountId,
        isDealer: authIsDealer,
      });

      const customers = await Customer.findAll({
        include: [
          {
            model: Lead,
            attributes: ['id', 'accountId'],
          },
        ],
        where,
        nest: true,
        raw: true,
      });

      return response.status(200).send(customers);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async findByName(request: Request, response: Response) {
    const { filters } = GridQueryParser.parse(request.query);
    const { authAccountId, authIsDealer } = request;

    try {
      const where = await getWhereCustomer({
        filters,
        authAccountId,
        isDealer: authIsDealer,
      });

      const customers = await Customer.findAll({
        include: [
          {
            model: Lead,
            attributes: ['id', 'accountId'],
          },
        ],
        where,
        nest: true,
        raw: true,
        order: [['lastName', 'asc']],
      });

      return response.status(200).send(customers);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }

  async generateCard(request: Request, response: Response, next: NextFunction) {
    const { customerId } = request.params;
    if (!customerId) {
      return next(new BadRequestException('A identificação do cliente não pôde ser recuperada'));
    }

    // GLOBAL VALUES
    const scoreToImageMapping = {
      A: './assets/score/score-a.png',
      B: './assets/score/score-b.png',
      C: './assets/score/score-c.png',
      D: './assets/score/score-d.png',
      F: './assets/score/score-f.png',
      X: './assets/score/score-x.png',
    };

    const fulfillmentToImageMapping = {
      '1': './assets/fulfillmentStatus/incomplete.png',
      '2': './assets/fulfillmentStatus/inprogress.png',
      '3': './assets/fulfillmentStatus/complete.png',
    };

    async function create(dataForQRcode: string, width: number, cwidth: number) {
      const QRcanvas = createCanvas(width, width);
      QRCode.toCanvas(QRcanvas, dataForQRcode, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: '#2c3357',
          light: '#ffffff',
        },
      });
      const ctx = QRcanvas.getContext('2d');
      const img = await loadImage('./assets/BorgesLogo.png');
      const center = (QRcanvas.width - cwidth) / 2;
      ctx.drawImage(img, center, center, cwidth, cwidth);
      return QRcanvas.toBuffer('image/png');
    }

    // GET CUSTOMER INFO
    try {
      const customer = await getCustomerById(customerId);
      const quotes = await Quote.findAll({
        include: [
          {
            model: Lead,
            include: [
              {
                model: Customer,
                attributes: [],
              },
            ],
          },
          {
            model: Inventory,
          },
          {
            model: QuoteStatus,
          },
        ],
        where: {
          '$lead.customerId$': customerId,
        },
        raw: true,
        nest: true,
      });
      const countFavorites = quotes.length;
      const countVisits = quotes.filter(quote => [10, 12, 13].includes(quote.quoteInstanceId)).length;
      const countPurchases = quotes.filter(quote => [20, 22].includes(quote.quoteInstanceId)).length;

      // CARD RENDERIZATION

      // PRINT TEMPLATE
      const width = 1080;
      const height = 1523;
      const canvas = createCanvas(width, height);
      const context = canvas.getContext('2d');
      let pictureImage = await loadImage('./assets/customer-card-template.png');
      context.drawImage(pictureImage, 0, 0);

      // MARGIN DEFINITIONS
      const mainMargin_X = 90;
      const mainMargin_Y = 90;
      let lastPosition_X;
      let lastPosition_Y;
      // DRAW SCORE IMAGE
      var scoreImage;
      switch (customer.analysis.score) {
        case 'A':
          scoreImage = await loadImage(scoreToImageMapping['A']);
          break;
        case 'B':
          scoreImage = await loadImage(scoreToImageMapping['B']);
          break;
        case 'C':
          scoreImage = await loadImage(scoreToImageMapping['C']);
          break;
        case 'D':
          scoreImage = await loadImage(scoreToImageMapping['D']);
          break;
        case 'F':
          scoreImage = await loadImage(scoreToImageMapping['F']);
          break;
        default:
          scoreImage = await loadImage(scoreToImageMapping['X']);
          break;
      }
      context.drawImage(scoreImage, mainMargin_X, mainMargin_Y, 130, 130);
      lastPosition_X = mainMargin_X + 130;
      lastPosition_Y = mainMargin_Y + 130;

      // Name and Last Name
      const textName = customer.firstName + ' ' + customer.lastName;
      context.font = 'bold 35pt Poppins';
      context.textAlign = 'left';
      context.fillStyle = '#2c3357';
      context.fillText(textName, lastPosition_X + 32, lastPosition_Y - 80);
      lastPosition_X = lastPosition_X + 32;
      lastPosition_Y = lastPosition_Y - 80;

      let textScoreStatus;
      context.font = 'bold 30pt Poppins';
      context.textAlign = 'left';
      switch (customer.analysis.score) {
        case 'A':
          context.fillStyle = '#6bbe45';
          textScoreStatus = 'Excelente';
          break;
        case 'B':
          context.fillStyle = '#6bbe45';
          textScoreStatus = 'Muy Bueno';
          break;
        case 'C':
          context.fillStyle = '#f3bc1b';
          textScoreStatus = 'Bueno';
          break;
        case 'D':
          context.fillStyle = '#d8582b';
          textScoreStatus = 'Regular';
          break;
        case 'F':
          context.fillStyle = '#ce1f3e';
          textScoreStatus = 'Necesita Co-Deudor';
          break;
        default:
          context.font = '30pt Poppins';
          context.fillStyle = '#ce1f3e';
          textScoreStatus = 'Hubo un error';
          break;
      }
      context.fillText(textScoreStatus, lastPosition_X + 300, lastPosition_Y + 53);
      lastPosition_X = lastPosition_X + 300;
      lastPosition_Y = lastPosition_Y + 53;

      // Flush X position
      lastPosition_X = mainMargin_X;

      // Personal Info
      let personalInfoFulfillmentStatus;
      switch (customer.fulfillmentStatus.id) {
        case 1:
          context.fillStyle = '#ce1f3e';
          personalInfoFulfillmentStatus = customer.fulfillmentStatus.name;
          break;
        case 2:
          context.fillStyle = '#f3bc1b';
          personalInfoFulfillmentStatus = customer.fulfillmentStatus.name;
          break;
        case 3:
          context.fillStyle = '#6bbe45';
          personalInfoFulfillmentStatus = customer.fulfillmentStatus.name;
          break;
        default:
          personalInfoFulfillmentStatus = 'Not defined';
          break;
      }
      context.font = 'bold 30pt Poppins';
      context.textAlign = 'left';
      context.fillText(personalInfoFulfillmentStatus, lastPosition_X + 495, lastPosition_Y + 84);
      lastPosition_X = lastPosition_X + 495;
      lastPosition_Y = lastPosition_Y + 84;

      let fulfillmentImage;
      switch (customer.fulfillmentStatus.id) {
        case 1:
          fulfillmentImage = await loadImage(fulfillmentToImageMapping['1']);
          break;
        case 2:
          fulfillmentImage = await loadImage(fulfillmentToImageMapping['2']);
          break;
        case 3:
          fulfillmentImage = await loadImage(fulfillmentToImageMapping['3']);
          break;
        default:
          fulfillmentImage = await loadImage(fulfillmentToImageMapping['1']);
          break;
      }
      context.drawImage(fulfillmentImage, lastPosition_X + 270, lastPosition_Y - 40, 50, 50);

      // Flush X position
      lastPosition_X = mainMargin_X;

      //DNI
      const textDNI = customer.citizenNumber;
      context.font = '30pt Poppins';
      context.textAlign = 'left';
      context.fillStyle = '#2c3357';
      context.fillText(textDNI, mainMargin_X + 160, lastPosition_Y + 60);
      lastPosition_Y = lastPosition_Y + 60;

      //PHONE
      if (!customer.phoneNumber) {
        context.font = 'bold 30pt Poppins';
        context.fillStyle = '#f3bc1b';
      }
      const textPhone = customer.phoneNumber || 'Incompleto';
      context.fillText(textPhone, mainMargin_X + 270, lastPosition_Y + 53);
      lastPosition_Y = lastPosition_Y + 53;

      //JOB TYPE
      let jobType2Text;
      context.font = '30pt Poppins';
      context.fillStyle = '#2c3357';
      switch (customer.jobType) {
        case 1:
          jobType2Text = 'Assalariado';
          break;
        case 2:
          jobType2Text = 'Aposentado';
          break;
        case 3:
          jobType2Text = 'Autônomo';
          break;
        case 4:
          jobType2Text = 'Trabalhador informal';
          break;
        case 5:
          jobType2Text = 'Trabalhador informal Autônomo';
          break;
        default:
          context.font = 'bold 8pt Menlo';
          context.fillStyle = '#f3bc1b';
          jobType2Text = 'Falha na indicação do status de emprego';
          break;
      }
      jobType2Text;
      context.fillText(jobType2Text, mainMargin_X + 454, lastPosition_Y + 51);
      lastPosition_Y = lastPosition_Y + 51;

      // DECLARED INCOME

      if (!customer.declaredIncome) {
        context.font = 'bold 30pt Poppins';
        context.fillStyle = '#f3bc1b';
      }
      const declaredIncome = customer.declaredIncome ? '$ ' + customer.declaredIncome : 'Incompleto';
      const textDeclaredIncome = declaredIncome;
      context.fillText(textDeclaredIncome, mainMargin_X + 530, lastPosition_Y + 52);
      lastPosition_Y = lastPosition_Y + 52;

      // DOCUMENT PICTURES

      let citizenFrontFulFillment = customer.idFrontImage
        ? await loadImage('./assets/fulfillmentStatus/complete.png')
        : await loadImage('./assets/fulfillmentStatus/incomplete.png');
      let citizenBackFulFillment = customer.idBackImage
        ? await loadImage('./assets/fulfillmentStatus/complete.png')
        : await loadImage('./assets/fulfillmentStatus/incomplete.png');
      let citizenAddressFulFillment = customer.addressCertificate
        ? await loadImage('./assets/fulfillmentStatus/complete.png')
        : await loadImage('./assets/fulfillmentStatus/incomplete.png');
      let citizenIncomeFulFillment = customer.incomeCertificate
        ? await loadImage('./assets/fulfillmentStatus/complete.png')
        : await loadImage('./assets/fulfillmentStatus/incomplete.png');

      context.drawImage(citizenFrontFulFillment, mainMargin_X + 335, lastPosition_Y + 18, 50, 50);
      context.drawImage(citizenBackFulFillment, mainMargin_X + 335, lastPosition_Y + 70, 50, 50);
      context.drawImage(citizenAddressFulFillment, mainMargin_X + 830, lastPosition_Y + 18, 50, 50);
      context.drawImage(citizenIncomeFulFillment, mainMargin_X + 830, lastPosition_Y + 70, 50, 50);
      lastPosition_Y = lastPosition_Y + 70;

      // FAVORITES COUNT
      context.font = 'bold 35pt Poppins';
      context.textAlign = 'center';
      context.fillStyle = '#2c3357';
      context.fillText(countFavorites.toString(), mainMargin_X + 313, lastPosition_Y + 155);
      // APPLICATIONS COUNT
      context.fillText('0', mainMargin_X + 390, lastPosition_Y + 208); // TBD
      // VISITS COUNT
      context.fillText(countVisits.toString(), mainMargin_X + 690, lastPosition_Y + 155);
      // PURCHASES COUNT
      context.fillText(countPurchases.toString(), mainMargin_X + 750, lastPosition_Y + 208);
      lastPosition_Y = lastPosition_Y + 215;

      const qrData = {
        id: customer.id,
        citizenNumber: customer.citizenNumber,
        firstName: customer.firstName,
        lastName: customer.lastName,
        declaredIncome: customer.declaredIncome,
        email: customer.email,
        score: customer.analysis.score,
        documentFulfillmentStatus: customer.fulfillmentStatus.name,
      };

      const qrImageBuffer = await create(JSON.stringify(qrData), 450, 64);

      const qrImage = await loadImage(qrImageBuffer);
      context.drawImage(qrImage, mainMargin_X + 40, lastPosition_Y + 60, 410, 410);

      // Send Image
      const buffer = canvas.toBuffer('image/png');
      response.setHeader('content-type', 'image/png');
      return response.status(200).send(buffer);
    } catch (error) {
      console.log(error);
      return response.status(500).send(error);
    }
  }
}

export default CustomerController;
