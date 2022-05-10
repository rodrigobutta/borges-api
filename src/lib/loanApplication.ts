import LoanApplicationFetchException from '../exceptions/NotFoundException';
import { LoanApplication } from '../models/LoanApplication';
import { Offer } from '../models/Offer';
import { LoanApplicationRevision } from '../models/LoanApplicationRevision';
import { LoanApplicationActivity } from '../models/LoanApplicationActivity';
import { Person } from '../models/Person';
import { Quote } from '../models/Quote';
import { Lead } from '../models/Lead';
import { Customer } from '../models/Customer';
import { Profile } from '../models/Profile';
import { Inventory } from '../models/Inventory';
import { Account } from '../models/Account';
import { InventoryStatus } from '../models/InventoryStatus';
import { LoanApplicationStatus } from '../models/LoanApplicationStatus';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { LOAN_APPLICATION_STATUS, LOAN_APPLICATION_STATUS_REASON } from '../constants';
import { getJson, isValidJson, valueExistsInArray } from '../utils/common';
import OfferNotFoundException from '../exceptions/OfferNotFoundException';
import QuoteNotFoundException from '../exceptions/QuoteNotFoundException';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import { QUOTE_STATUS, APPLICATION_STATUS, APPLICATION_STATUS_REASON, INVENTORY_STATUS } from '../constants';
import QuoteIsCanceledException from '../exceptions/QuoteIsCanceledException';
import InventoryNotPublished from '../exceptions/InventoryNotPublished';
import { isEmpty } from 'lodash';
import { getPersons } from '../utils/persons';
import { validate } from '../utils/validator';
import { resumeValidations } from '../utils/loanApplicationValidation';
import {
  buyerSchema,
  coupleSchema,
  inventorySchema,
  accountSchema,
} from '../constants/loanApplication.validations.schemas';
import { LoanApplicationStatusReason } from '../models/LoanApplicationStatusReason';
import { changeInventoryStatus } from './inventory';
import InternalError from '../exceptions/InternalError';
import NotFoundException from '../exceptions/NotFoundException';
import { LoanApplicationProviderLog } from '../models/LoanApplicationProviderLog';
import { qitech } from '../providers/qitech';
import { JwtPayload } from 'jsonwebtoken';
import BadRequestException from '../exceptions/BadRequestException';

import fetch from 'node-fetch'
const S3 = require('../providers/aws/s3');

// INTERFACES

interface ISectionError {
  id: string;
  errors?: string[];
  name?: string;
  sections?: ISectionError[];
}

interface IFormError {
  errors?: string[];
  sections?: ISectionError[];
}

export interface Persons {
  buyer?: Person;
  cosigner?: Person;
  couple?: Person;
}

export interface ILoanApplicationActivityData {
  loanApplicationStatusReasonId?: number;
  validations?: object[];
  feedback?: string;
  documents?: ILoanApplicationActivityDataDocument[];
  migratedRaw?: any;
}

export interface ILoanApplicationActivityDataDocument {
  name: string;
  url: string;
}

type IResponseBody = IFormError;

const APPLICATION_EXPIRATION_OFFSET_IN_DAYS = 7;

export const getApplication: any = async (id: number) => {
  const application = await LoanApplication.findByPk(id, {
    include: [
      {
        model: Lead,
        required: true,
        include: [
          {
            model: Customer,
            required: true,
            include: [{ model: CustomerAnalysis, required: true }],
          },
        ],
      },
      {
        model: Inventory,
        required: true,
        include: [{ model: InventoryStatus }],
      },
      {
        model: Offer,
      },
      {
        model: Quote,
      },
      {
        model: Profile,
        include: [
          {
            model: Account,
          },
        ],
      },
      {
        model: LoanApplicationStatus,
      },
      {
        model: LoanApplicationStatusReason,
      },
    ],
    raw: true,
    nest: true,
  });
  if (!application) {
    throw new NotFoundException();
  }

  const applicationPersons = await Person.findAll({
    where: {
      loanApplicationId: id,
    },
  });

  const revisions = await LoanApplicationRevision.findAll({
    where: {
      consumerLoanApplicationId: id,
    },
    order: [['id', 'DESC']],
  });

  const revision = await LoanApplicationRevision.findOne({
    attributes: [
      'id',
      'responseAt',
      'responseType',
      'responseErrors',
      'responseLocked',
      'responseNotes',
      'responseUserId',
      'createdAt',
      'updatedAt',
    ],
    where: {
      consumerLoanApplicationId: id,
    },
    nest: true,
    raw: true,
    order: [['id', 'DESC']],
  });

  const activity = await getLoanApplicationActivity(id);

  const lastActivity = activity && activity.length > 0 ? activity[0] : undefined;

  let person: Persons = {};

  applicationPersons.forEach(p => {
    const nature = p.loanApplicationNature;
    person[nature as keyof Persons] = p;
  });

  const output = { ...application, person, revision, revisions, lastActivity, activity };

  return output;
};

export const getLoanApplicationActivity: any = async (loanApplicationId: number) => {
  const activity = await LoanApplicationActivity.findAll({
    where: { loanApplicationId },
    include: [
      { model: LoanApplicationStatus },
      {
        model: Profile,
      },
      {
        model: Account,
      },
    ],
    order: [['createdAt', 'DESC']],
    nest: true,
    raw: true,
  });

  const curatedActivity = activity.map(a => {
    return {
      ...a,
      data: {
        ...a.data,
        ...(a.data?.validations && { validationResume: resumeValidations(a.data?.validations) }),
        ...(a.data?.migratedRaw && { raw: JSON.parse(a.data?.migratedRaw) }),
      },
    };
  });

  return curatedActivity;
};

export const createOrUpdateApplication: any = async ({
  userId,
  offerId,
  quoteId,
}: {
  userId: number;
  offerId: number;
  quoteId: number;
}) => {
  const offer = await Offer.findOne({
    where: {
      id: offerId,
    },
    nest: true,
    raw: true,
  });
  if (!offer) {
    console.log('Error fetching offer');
    throw new OfferNotFoundException();
  }

  const quote = await Quote.findByPk(quoteId, {
    include: [
      {
        model: Inventory,
      },
    ],
    nest: true,
    raw: true,
  });

  if (!quote) {
    console.log('Error fetching quote');
    throw new QuoteNotFoundException();
  }
  if (quote.quoteInstanceId === QUOTE_STATUS['canceled']) {
    console.log('Error. Can not create an application from a canceled quote');
    throw new QuoteIsCanceledException();
  }

  if (quote.inventory.inventoryStatusId !== INVENTORY_STATUS['published']) {
    console.log('Error. Inventory is not published anymore');
    throw new InventoryNotPublished();
  }

  const lead = await Lead.findByPk(quote.leadId, {
    include: [{ model: Customer }],
    nest: true,
    raw: true,
  });

  if (!lead) {
    console.log('Error fetching lead');
    throw new LeadNotFoundException();
  }

  const cosigner = await Customer.findByPk(quote.cosignerCustomerId, {
    nest: true,
    raw: true,
  });

  let expiration = new Date();
  expiration.setDate(expiration.getDate() + APPLICATION_EXPIRATION_OFFSET_IN_DAYS);

  const applicationExists = await LoanApplication.findOne({
    where: {
      consumerLoanRequestId: quoteId,
    },
  });
  if (applicationExists) {
    await LoanApplication.update(
      {
        userId,
        offerId: offer.id,
        leadId: quote.leadId,
        loanApplicationStatusId: APPLICATION_STATUS['created'],
        loanApplicationStatusReasonId: APPLICATION_STATUS_REASON['no-reason'],
        inventoryId: quote.inventoryId,
        inventorySnapshotId: quote.inventorySnapshotId,
        expiresAt: expiration,
      },
      {
        where: {
          id: applicationExists.id,
        },
      },
    );
  } else {
    await LoanApplication.create({
      userId,
      offerId: offer.id,
      consumerLoanRequestId: quote.id,
      leadId: quote.leadId,
      loanApplicationStatusId: APPLICATION_STATUS['created'],
      loanApplicationStatusReasonId: APPLICATION_STATUS_REASON['no-reason'],
      inventoryId: quote.inventoryId,
      inventorySnapshotId: quote.inventorySnapshotId,
      expiresAt: expiration,
    });
  }

  const application = await LoanApplication.findOne({
    where: {
      consumerLoanRequestId: quoteId,
    },
  });  

  if (!application) {
    throw new InternalError('Error creating application');
  }

  const docsInCustomerToLoanApp = ['idFrontImage', 'addressCertificate', 'incomeCertificate']
  const fieldsOfFilesInLoanApp = ['rg', 'addressVoucher', 'rentVoucher']

  docsInCustomerToLoanApp.forEach( async (docToFillLoanApp: any, index) => {
    
    if( lead.customer.hasOwnProperty(docToFillLoanApp)
        && lead.customer[docToFillLoanApp as keyof Customer] !== null
      ){
      
      const { url, name } = lead.customer[docToFillLoanApp as keyof Customer]

      const fileUploaded = await fetch(url).then( async response => {
        const responseToBuffer: ArrayBuffer = await response.arrayBuffer()
        const rta = await S3.upload(Buffer.from(responseToBuffer), `${application?.id}_${name.replace(/\s+/g, '')}`)
        return rta
      });

      const fieldOfFile = fieldsOfFilesInLoanApp[index]

      const propToUpdate = {
        [fieldOfFile] : fileUploaded
      }
      
      await LoanApplication.update(propToUpdate,
        { where: {
            id: application?.id  
          }
        }
      )
    }
  })

  Person.upsert({
    loanApplicationId: application.id,
    loanApplicationNature: 'buyer',

    firstName: lead.customer.firstName,
    lastName: lead.customer.lastName,
    citizenNumber: lead.customer.citizenNumber,
    cellPhone: lead.customer.phoneNumber,
    personalEmail: lead.customer.email,
  });

  if (cosigner) {
    //cosigner exists
    Person.upsert({
      loanApplicationId: application.id,
      loanApplicationNature: 'garant',

      firstName: cosigner.firstName,
      lastName: cosigner.lastName,
      citizenNumber: cosigner.citizenNumber,
      cellPhone: cosigner.phoneNumber,
      personalEmail: cosigner.email,
      // civilState: cosigner.civilState
    });
  }

  await Quote.update(
    {
      quoteInstanceId: QUOTE_STATUS['quote-accepted'],
    },
    {
      where: {
        id: quote.id,
      },
    },
  );

  await changeInventoryStatus({ inventoryId: quote.inventoryId, statusCode: 'locked-reserved' });

  return application;
};

export const saveApplication: any = async ({
  id,
  person,
  propsToUpdate,
  profileId,
  accountId,
}: {
  id: number;
  person: any;
  propsToUpdate: any;
  profileId?: number | null;
  accountId?: number | null;
}) => {
  try {
    await LoanApplication.update(propsToUpdate, {
      where: {
        id,
      },
    });
    Object.keys(person).forEach(async nature => {
      await Person.upsert({
        loanApplicationId: id,
        loanApplicationNature: nature,
        ...person[nature],
      });
    });

    // At this point no error ocurred,
    // if application is new and there is data to update, created > in-progress
    const loanApplication = await LoanApplication.findByPk(id, {
      include: [
        {
          model: LoanApplicationStatus,
        },
      ],
      nest: true,
      raw: true,
    });
    if ((!isEmpty(person) || !isEmpty(propsToUpdate)) && loanApplication?.loanApplicationStatus.code === 'created') {
      await changeStatus(id, {
        loanApplicationStatusCode: 'in-progress',
        profileId,
        accountId,
      });
    }
  } catch (error) {
    throw error;
  }
};

export const cancelApplication: any = async ({ id, reason }: { id: number; reason: any }) => {
  try {
    const loanApplication = await LoanApplication.findByPk(id, {
      include: [
        {
          model: LoanApplicationStatus,
        },
      ],
      nest: true,
      raw: true,
    });

    console.log(loanApplication, reason);
  } catch (error) {
    throw error;
  }
};

// TODO REB refactor this nodes
export const validateApplication = async (consumerLoanApplicationId: number) => {
  let buyerErrors: string[] = [];
  let coupleErrors: string[] = [];
  let cosignerErrors: string[] = [];
  let inventoryErrors: string[] = [];
  let accountErrors: string[] = [];

  try {
    const persons = await Person.findAll({ where: { loanApplicationId: consumerLoanApplicationId } });

    const loanRequestApplication: any = await LoanApplication.findByPk(consumerLoanApplicationId, {
      include: [
        {
          model: Inventory,
        },
        {
          model: Profile,
          include: [
            {
              model: Account,
            },
          ],
        },
      ],
    });

    const { buyer, couple, cosigner } = getPersons(persons);
    const { inventory, user } = loanRequestApplication && loanRequestApplication.toJSON();
    const { account } = user;

    await validate(buyerSchema, buyer)
      .then()
      .catch((err: any) => {
        buyerErrors = isEmpty(buyer) ? ['Debe completar los datos del comprador.'] : err.errors;
      });

    cosigner &&
      (await validate(buyerSchema, cosigner) // TODO need cosigner validations to create it's own schema
        .then()
        .catch((err: any) => {
          cosignerErrors = isEmpty(cosigner) ? ['Debe completar los datos del cosignatario.'] : err.errors;
        }));

    buyer?.civilStatus === 'married' &&
      (await validate(coupleSchema, couple)
        .then()
        .catch((err: any) => {
          coupleErrors = isEmpty(couple) ? ['Debe completar los datos del cónyuge.'] : err.errors;
        }));

    await validate(inventorySchema, inventory)
      .then()
      .catch((err: any) => {
        inventoryErrors = err.errors;
      });

    await validate(accountSchema, account)
      .then()
      .catch((err: any) => {
        accountErrors = err.errors;
      });

    const output: IResponseBody = {
      sections: [
        {
          id: 'datos-registro',
          name: 'Datos de registro',
          sections: [
            { id: 'buyer', name: 'Comprador', errors: buyerErrors },
            { id: 'couple', name: 'Cónyuge', errors: coupleErrors },
            { id: 'cosigner', name: 'Cosignatario', errors: cosignerErrors },
          ],
        },
        {
          id: 'datos-vehiculo',
          name: 'Datos Del Vehículo',
          sections: [{ id: 'inventory', name: 'Vehículo', errors: inventoryErrors }],
        },
        {
          id: 'datos-account',
          name: 'Preferencias',
          sections: [{ id: 'account', name: 'Información General', errors: accountErrors }],
        },
      ],
    };

    const returnOutput =
      !isEmpty(buyerErrors) ||
      !isEmpty(cosignerErrors) ||
      !isEmpty(coupleErrors) ||
      !isEmpty(inventoryErrors) ||
      !isEmpty(accountErrors);

    return returnOutput ? output : null;
  } catch (error) {
    console.log('Error: ', error);
    throw 'Ocurrio en Error en loanAppplication Validator.';
  }
};

export const getLoanAppOLD = async (id: number) => {
  try {
    const loanApplication = await LoanApplication.findByPk(id, {
      include: [
        {
          model: Offer,
          required: true,
        },
        {
          model: Quote,
          required: true,
        },
        {
          model: Profile,
          required: true,
          include: [
            {
              model: Account,
              required: true,
            },
          ],
        },
        {
          model: Inventory,
          required: true,
          include: [{ model: InventoryStatus }],
        },
        {
          model: Lead,
          required: true,
          include: [
            {
              model: Customer,
              required: true,
              include: [{ model: CustomerAnalysis, required: true }],
            },
          ],
        },
      ],
      nest: true,
      raw: true,
    });
    if (!loanApplication) {
      throw new NotFoundException('Could not find consumer loan application.');
    }

    let activities = await LoanApplicationActivity.findAll({
      where: { loanApplicationId: loanApplication.id },
      include: [{ model: LoanApplicationStatus }],
      order: [['createdAt', 'DESC']],
    });

    if (!activities) {
      activities = [];
    }
    loanApplication.activities = activities;

    const revision = await LoanApplicationRevision.findOne({
      attributes: [
        'id',
        'responseAt',
        'responseType',
        'responseErrors',
        'responseLocked',
        'responseNotes',
        'responseUserId',
        'createdAt',
        'updatedAt',
      ],
      where: {
        consumerLoanApplicationId: id,
      },
      nest: true,
      raw: true,
      order: [['id', 'DESC']],
    });

    const person: any = {};
    const persons = await Person.findAll({
      where: {
        loanApplicationId: id,
      },
      nest: true,
      raw: true,
    });
    persons.forEach((p: Person) => {
      const { loanApplicationNature, ...propsToGet } = p;
      person[loanApplicationNature] = propsToGet;
    });
    return {
      ...loanApplication,
      person,
      revision,
    };
  } catch (e) {
    console.log('error', e);
    throw new LoanApplicationFetchException();
  }
};

export async function changeStatus(
  loanApplicationId: number | string,
  {
    loanApplicationStatusCode,
    loanApplicationStatusId = null,
    loanApplicationStatusReasonCode,
    loanApplicationStatusReasonId = null,
    data = null,
    profileId,
    accountId,
  }: {
    loanApplicationStatusCode?: keyof typeof LOAN_APPLICATION_STATUS | null;
    loanApplicationStatusId?: number | null;
    loanApplicationStatusReasonCode?: keyof typeof LOAN_APPLICATION_STATUS_REASON | null;
    loanApplicationStatusReasonId?: number | null;
    data?: any | null;
    profileId?: number | null;
    accountId?: number | null;
  },
): Promise<boolean> {
  let statusId = null;
  if (loanApplicationStatusId && valueExistsInArray(LOAN_APPLICATION_STATUS, loanApplicationStatusId)) {
    statusId = loanApplicationStatusId;
  } else if (loanApplicationStatusCode && loanApplicationStatusCode in LOAN_APPLICATION_STATUS) {
    statusId = LOAN_APPLICATION_STATUS[loanApplicationStatusCode];
  }
  if (!statusId) {
    console.error('Loan Applicaation status not found');
    return false;
  }

  let statusReasonId = null;
  if (
    loanApplicationStatusReasonId &&
    valueExistsInArray(LOAN_APPLICATION_STATUS_REASON, loanApplicationStatusReasonId)
  ) {
    statusReasonId = loanApplicationStatusReasonId;
  } else if (loanApplicationStatusReasonCode && loanApplicationStatusReasonCode in LOAN_APPLICATION_STATUS_REASON) {
    statusReasonId = LOAN_APPLICATION_STATUS_REASON[loanApplicationStatusReasonCode];
  }

  try {
    await LoanApplication.update(
      {
        loanApplicationStatusId: statusId,
        ...(statusReasonId && { loanApplicationStatusReasonId: statusReasonId }),
      },
      {
        where: {
          id: loanApplicationId,
        },
      },
    );

    await createActivity(loanApplicationId, {
      loanApplicationStatusId: statusId,
      loanApplicationStatusReasonId: statusReasonId,
      data,
      profileId,
      accountId,
    });
  } catch (error) {
    console.error('Error updating Loan Application status:', error);
    return false;
  }

  return true;
}

export async function createActivity(
  loanApplicationId: number | string,
  {
    loanApplicationStatusId,
    loanApplicationStatusReasonId = null,
    data = null,
    profileId = null,
    accountId = null,
  }: {
    loanApplicationStatusId?: number;
    loanApplicationStatusReasonId?: number | null;
    data?: any | null;
    profileId?: number | null;
    accountId?: number | null;
  },
): Promise<boolean> {
  try {
    let curatedActivityData: ILoanApplicationActivityData = {
      ...(data && data.validations && { validations: data.validations }),
      ...(data && data.feedback && { feedback: data.feedback }),
      ...(data && data.documents && { documents: data.documents }),
      ...(loanApplicationStatusReasonId && { loanApplicationStatusReasonId }),
      ...(data && { raw: data }),
    };

    await LoanApplicationActivity.create({
      loanApplicationId,
      loanApplicationStatusId,
      ...(profileId && { userId: profileId }),
      ...(accountId && { accountId }),
      data: curatedActivityData,
    });
  } catch (error) {
    console.error('Error updating Loan Application status:', error);
    return false;
  }

  return true;
}

export const getApplicationActivity: any = async (id: number) => {
  const application = await LoanApplication.findByPk(id, {
    include: [
      {
        model: Lead,
        required: true,
        include: [
          {
            model: Customer,
            required: true,
            include: [{ model: CustomerAnalysis, required: true }],
          },
        ],
      },
      {
        model: Inventory,
        required: true,
        include: [{ model: InventoryStatus }],
      },
      {
        model: Offer,
      },
      {
        model: Quote,
      },
      {
        model: Profile,
        include: [
          {
            model: Account,
          },
        ],
      },
      {
        model: LoanApplicationStatus,
      },
      {
        model: LoanApplicationStatusReason,
      },
    ],
    raw: true,
    nest: true,
  });
  if (!application) {
    throw new NotFoundException();
  }

  const applicationPersons = await Person.findAll({
    where: {
      loanApplicationId: id,
    },
  });

  const revisions = await LoanApplicationRevision.findAll({
    where: {
      consumerLoanApplicationId: id,
    },
    order: [['id', 'DESC']],
  });

  const revision = await LoanApplicationRevision.findOne({
    attributes: [
      'id',
      'responseAt',
      'responseType',
      'responseErrors',
      'responseLocked',
      'responseNotes',
      'responseUserId',
      'createdAt',
      'updatedAt',
    ],
    where: {
      consumerLoanApplicationId: id,
    },
    nest: true,
    raw: true,
    order: [['id', 'DESC']],
  });

  interface Persons {
    buyer?: Person;
    cosigner?: Person;
    couple?: Person;
  }

  let person: Persons = {};

  applicationPersons.forEach(p => {
    const nature = p.loanApplicationNature;
    person[nature as keyof Persons] = p;
  });

  const output = { ...application, person, revision, revisions };

  return output;
};

export const getLoanApplicationProviderLogs: any = async (loanApplicationId: number) => {
  const logs = await LoanApplicationProviderLog.findAll({
    where: { loanApplicationId },
    order: [['createdAt', 'DESC']],
    nest: true,
    raw: true,
  });

  const curatedLogs = logs.map(a => {
    return {
      ...a,
      ...(a.requestData?.data && { requestData: { ...getJson(a.requestData.data) } }),
      ...(a.responseData?.data && { responseData: { ...getJson(a.responseData.data) } }),
    };
  });

  return curatedLogs;
};

export const providerQitechUpdateStatus: any = async (body: string) => {
  try {
    const decodedMessage = !isValidJson(body) ? (body as unknown as JwtPayload) : await qitech.decodeMessage(body);

    const loanApplication = await LoanApplication.findOne({
      attributes: ['id'],
      where: { externalKey: decodedMessage?.key },
    });

    if (!loanApplication) {
      throw new NotFoundException(`LoanApplication not found with id "${decodedMessage?.key}" not found`);
    }

    await LoanApplicationProviderLog.create({
      loanApplicationId: loanApplication.id,
      type: 'webhook_update_status',
      url: '',
      method: '',
      requestData: decodedMessage,
    });

    const incomingStatus = decodedMessage.status;
    if (!incomingStatus) {
      throw new BadRequestException(`Status field couldn't be retrieved from the hook payload`);
    }
    const incomingStatusCode = qiTechStatusCodeToLoanApplicationStatusCode(decodedMessage.status);

    const documents: ILoanApplicationActivityDataDocument[] = [];
    switch (incomingStatusCode) {
      case 'qit-signature_finished':
        if (decodedMessage.signed_contract_url) {
          documents.push({
            name: 'Contrato',
            url: decodedMessage.signed_contract_url,
          });
        }
      case 'qit-waiting_signature':
        if (decodedMessage.data?.contract?.urls && decodedMessage.data?.contract?.urls.length > 0) {
          documents.push({
            name: 'Contrato',
            url: decodedMessage.data.contract.urls[0],
          });
        }
      case 'qit-disbursed':
        if (decodedMessage.data?.ted_receipt_list && decodedMessage.data?.ted_receipt_list.length > 0) {
          documents.push({
            name: 'Recibo',
            url: decodedMessage.data.ted_receipt_list[0].url,
          });
        }
      default:
    }

    await changeStatus(loanApplication.id, {
      loanApplicationStatusCode: incomingStatusCode,
      data: { ...decodedMessage, documents },
    });

    return true;
  } catch (error) {
    throw new InternalError(error);
  }
};

export const qiTechStatusCodeToLoanApplicationStatusCode = (code: string) => {
  return `qit-${code}` as unknown as keyof typeof LOAN_APPLICATION_STATUS;
};
