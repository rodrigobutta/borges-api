import { Op, Sequelize, WhereOptions } from 'sequelize';
import { LoanApplication } from '../models/LoanApplication';
import { Lead } from '../models/Lead';
import { BUYER, INTERESTED, LeadStatus, NOT_INTERESTED, VISITOR } from '../models/LeadStatus';
import { Quote } from '../models/Quote';
import { Profile } from '../models/Profile';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import { getCustomerById } from './customer';

export const leadResponse = (lead: Lead) => {
  return {
    ...lead,
    firstInteraction: {
      date: lead.createdAt,
      origin: lead.origin,
      attendedBy: lead.firstInteractionUser,
    },
    lastInteraction: {
      date: lead.lastInteractionAt,
      origin: lead.lastInteractionOrigin,
      attendedBy: lead.lastInteractionUser,
    },
  };
};

export const getLeadById: any = async (leadId: number) => {
  const include: any = [
    {
      model: Profile,
      as: 'firstInteractionUser',
      attributes: ['firstName', 'lastName', 'email', 'role'],
    },
    {
      model: Profile,
      as: 'lastInteractionUser',
      attributes: ['firstName', 'lastName', 'email', 'role'],
    },
  ];

  const lead = await Lead.findByPk(leadId, {
    include,
    raw: true,
    nest: true,
  });
  if (!lead) {
    throw new LeadNotFoundException();
  }

  const customer = await getCustomerById(lead.customerId);

  return {
    ...lead,
    customer,
  };
};

export const updateLeadStatus: any = async (leadId: number) => {
  let conditions: Map<string, any> = new Map();
  conditions.set('leadId', leadId);
  conditions.set('quoteInstanceId', {
    [Op.or]: {
      [Op.is]: null,
      [Op.notIn]: Sequelize.literal(
        `(Select qi.id from quoteInstances qi where qi.code like 'not-interested%' and qi.id = quoteInstanceId)`,
      ),
    },
  });
  const quoteWhere: WhereOptions = Sequelize.and(Object.fromEntries(conditions));

  let conditionsApp: Map<string, any> = new Map();
  conditionsApp.set('leadId', leadId);

  const applicationWhere: WhereOptions = Sequelize.and(Object.fromEntries(conditionsApp));
  const lead = await Lead.findByPk(leadId, {
    include: [{ model: LeadStatus }],
    raw: true,
    nest: true,
  });

  let needUpdate = false;
  let statusCode = '';

  if (lead) {
    const hasApplications = (await LoanApplication.count({ where: applicationWhere })) > 0;

    if (hasApplications) {
      statusCode = BUYER;
    }
    const hasQuotes = hasApplications ? false : (await Quote.count({ where: quoteWhere })) > 0;

    if (hasQuotes) {
      statusCode = INTERESTED;
    }

    if (!hasApplications && !hasQuotes) {
      statusCode = NOT_INTERESTED;
    }

    needUpdate = lead?.status?.code != statusCode;
  } else {
    statusCode = VISITOR;
    needUpdate = true;
  }

  if (needUpdate) {
    const status = await LeadStatus.findOne({ where: { code: statusCode } });
    console.log('Actualizo Lead!..', status, statusCode, leadId);
    await Lead.update(
      { leadStatusId: status?.id },
      {
        where: {
          id: leadId,
        },
      },
    );
  }
};
