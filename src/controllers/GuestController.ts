import { NextFunction, Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Lead } from '../models/Lead';
import { LeadActivity } from '../models/LeadActivity';
import { getLeadById } from '../lib/lead';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import { CONSUMER_ACCOUNT_ID } from '../constants';

const GUEST_SELF_USER_ID = 1;

class GuestController {
  async newLead(request: Request, response: Response, next: NextFunction) {
    try {
      const { body } = request;

      const now = new Date();

      const {
        citizenNumber, // TODO change to document
        jobType = 1,
        origin,
      } = body;

      let customer = await Customer.findOne({
        where: {
          citizenNumber,
        },
      });

      if (!customer) {
        customer = await Customer.create({
          citizenNumber,
          jobType,
          firstName: 'AUTO',
          lastName: 'AUTO',
          email: 'AUTO',
          cpf: citizenNumber, // TODO just in case, until we remove dirt
        });
      }

      const [lead, _wasCreated] = await Lead.findOrCreate({
        where: {
          customerId: customer.id,
          accountId: CONSUMER_ACCOUNT_ID,
        },
        defaults: {
          userId: GUEST_SELF_USER_ID,
          origin,
          lastInteractionAt: now,
          lastInteractionUserId: GUEST_SELF_USER_ID,
          lastInteractionOrigin: origin,
        },
      });

      await LeadActivity.create({
        leadId: lead.id,
        leadActivityTypeId: 1, // TODO keycloak logic to determine origin
        userId: GUEST_SELF_USER_ID,
        accountId: CONSUMER_ACCOUNT_ID,
        // description,
        // data,
      });

      const leadWithScore = await getLeadById(lead.id);
      if (!leadWithScore) {
        return next(new LeadNotFoundException());
      }

      return response.status(200).send(leadWithScore);
    } catch (e: any) {
      console.log(e);
      if (e.name === 'SequelizeValidationError') {
        return response.status(400).send('Validation errors: ' + e.errors.map((x: any) => x.path.split('-')));
      } else {
        return response.status(500).send('Error creating record.');
      }
    }
  }
}

export default GuestController;
