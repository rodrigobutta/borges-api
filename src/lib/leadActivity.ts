import { CONSUMER_ACCOUNT_ID, CONSUMER_API_USER_ID, LEAD_ACTIVITY_TYPE } from '../constants';
import { Client } from '../models/Client';
import { Lead } from '../models/Lead';
import { LeadActivity } from '../models/LeadActivity';
import { updateLeadStatus } from './lead';

export const addLeadActivity: any = async ({
  typeCode,
  leadId = null,
  customerId = null,
  profileId = null,
  accountId = null,
  description = null,
  data = null,
  client = null,
  authProfileId = null,
}: {
  typeCode: keyof typeof LEAD_ACTIVITY_TYPE | null;
  leadId?: number | null;
  customerId?: number | null;
  profileId?: number | null;
  accountId?: number | null;
  description?: string | null;
  data?: any | null;
  client?: Client | null;
  authProfileId?: number | null;
}) => {
  let realLeadId = leadId;
  let realAccountId = accountId || CONSUMER_ACCOUNT_ID;
  let realUserId = profileId || CONSUMER_API_USER_ID;

  let leadActivityTypeId = null;
  if (typeCode && typeCode in LEAD_ACTIVITY_TYPE) {
    leadActivityTypeId = LEAD_ACTIVITY_TYPE[typeCode];
  }
  if (!leadActivityTypeId) {
    console.error('Lead Activity type not found');
    return false;
  }

  console.log(
    'ADD LEAD ACTIVITY customerId, profileId, leadId, realAccountId',
    customerId,
    profileId,
    leadId,
    realAccountId,
  );

  if (!leadId) {
    if (customerId && profileId) {
      const lead = await Lead.findOne({
        attributes: ['id', 'accountId'],
        where: {
          customerId,
          userId: profileId,
        },
      });
      console.log(lead);
      if (lead) {
        realLeadId = lead.id;
        realAccountId = lead.accountId;
      }
    } else if (profileId && realAccountId) {
      const lead = await Lead.findOne({
        attributes: ['id'],
        where: {
          userId: profileId,
          accountId: realAccountId,
        },
      });
      if (lead) {
        realLeadId = lead.id;
      }
    } else if (customerId && realAccountId) {
      const lead = await Lead.findOne({
        attributes: ['id', 'profileId'],
        where: {
          customerId,
          accountId: realAccountId,
        },
      });
      if (lead) {
        realLeadId = lead.id;
        realUserId = lead.userId;
      }
    }
  }

  await updateLeadStatus(realLeadId);

  if (realLeadId) {
    await LeadActivity.create({
      leadId: realLeadId,
      leadActivityTypeId,
      profileId: realUserId,
      accountId: realAccountId,
      ...(client && { clientId: client.id }),
      description,
      data,
    });

    if (
      leadActivityTypeId === LEAD_ACTIVITY_TYPE['interaction'] ||
      leadActivityTypeId === LEAD_ACTIVITY_TYPE['consumer-register-existing-customer'] ||
      leadActivityTypeId === LEAD_ACTIVITY_TYPE['consumer-register-new-customer']
    ) {
      const now = new Date();

      await Lead.update(
        {
          lastInteractionAt: now,
          lastInteractionUserId: authProfileId,
        },
        {
          where: {
            id: realLeadId,
          },
        },
      );
    }
  }

  return true;
};
