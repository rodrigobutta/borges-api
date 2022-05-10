const moment = require('moment');
import { fetchCustomerAnalysis } from '../providers/besmart';
import { Customer } from '../models/Customer';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import settings from '../settings';
import { CustomerFulfillmentStatus } from '../models/CustomerFulfillmentStatus';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import { BESMART_DECISIONS } from '../providers/besmart/constants';
import { Op } from 'sequelize';
import InternalError from '../exceptions/InternalError';

export const analysisCacheNeedsRefresh = (customer: Customer) => {
  // check for no analysis
  const requestedAt = customer.analysis.requestedAt;
  if (!requestedAt) {
    return true;
  }

  // check for expired analysis
  const now = moment(new Date());
  const hoursFromLastScore = moment.duration(now.diff(requestedAt)).asHours();
  const expiredScore = hoursFromLastScore >= settings.preferences.analysisValidityInHours;

  // check for analysis that we want to retry
  const needsRetry = customer.analysis.decision === BESMART_DECISIONS.ERROR;

  return expiredScore || needsRetry;
};

export const customerResponse = (customer: any) => ({
  ...customer,
});

//pruebasApiBot
// TODO check duplicate with getCustomerByCitizenNumber
export const customerByCpf: any = async (citizenNumber: number) => {
  let customer = await Customer.findOne({
    where: {
      [Op.or]: [{ citizenNumber: citizenNumber }, { cpf: citizenNumber }],
    },
    include: [
      {
        model: CustomerAnalysis,
        as: 'analysis',
      },
      {
        model: CustomerFulfillmentStatus,
      },
    ],
    raw: true,
    nest: true,
  });
  if (!customer) {
    return null;
  }
  return customerResponse(customer);
};

//pruebasApiBot
export const checkCustomerByEmail: any = async (email: string) => {
  let customer = await Customer.findOne({
    where: {
      email: email,
    },
  });
  if (!customer) {
    return null;
  }
  return customerResponse(customer); // info is not need just response 200
};

export const getCustomerByCitizenNumber: any = async (citizenNumber: number) => {
  const customer = await Customer.findOne({
    attributes: ['id'],
    where: {
      citizenNumber,
    },
  });
  if (!customer) {
    throw new CustomerNotFoundException();
  }

  return getCustomerById(customer.id);
};

export const getCustomerById: any = async (customerId: number) => {
  try {
    const customer = await Customer.findByPk(customerId, {
      include: [
        {
          model: CustomerAnalysis,
          as: 'analysis',
        },
        {
          model: CustomerFulfillmentStatus,
        },
      ],
      raw: true,
      nest: true,
    });
    if (!customer) {
      return null;
    }

    if (analysisCacheNeedsRefresh(customer)) {
      const income = parseInt(String(customer.declaredIncome || customer.estimatedIncome));
      const citizenId = customer.citizenNumber;

      const fetchCustomerBesmart = await fetchCustomerAnalysis(citizenId, customer.jobType, '', income, customerId);

      const { score, code, reason, decision, result, customerData } = fetchCustomerBesmart;

      const now = new Date();

      await CustomerAnalysis.upsert({
        score,
        code,
        reason,
        decision,
        result,
        customerAnalysisLogId: fetchCustomerBesmart.logId,
        customerId: customerId,
        requestedAt: now,
      });

      await Customer.update(
        {
          estimatedIncome: customerData.estimatedIncome,
          firstName: customer.firstName || customerData.firstName || null,
          lastName: customer.lastName || customerData.lastName || null,
          phoneNumber: customer.phoneNumber || customerData.phoneNumber || null,
          // birthDate // TODO add birth field
        },
        {
          where: {
            id: customerId,
          },
        },
      );

      return getCustomerById(customer.id);
    }

    return customerResponse(customer);
  } catch (error) {
    throw new InternalError(error);
  }
};

export const calcCustomerFulfillmentStatus = (customer: Customer): number => {
  let fulfillmentStatus: number = 1; // TODO add enum

  const basicInfoComplete =
    customer.firstName && customer.firstName !== '' && customer.lastName && customer.lastName !== '';
  const contactInfoComplete = customer.phoneNumber && customer.phoneNumber !== '';
  const additionalInfoComplete = !!(
    customer.idFrontImage &&
    customer.idFrontImage.url &&
    customer.idFrontImage.url !== '' &&
    customer.idBackImage &&
    customer.idBackImage.url &&
    customer.idBackImage.url !== '' &&
    customer.addressCertificate &&
    customer.addressCertificate.url &&
    customer.addressCertificate.url !== '' &&
    customer.incomeCertificate &&
    customer.incomeCertificate.url &&
    customer.incomeCertificate.url !== ''
  );

  if (basicInfoComplete && (contactInfoComplete || additionalInfoComplete)) {
    fulfillmentStatus = 2; // TODO add enum;
  }

  if (basicInfoComplete && contactInfoComplete && additionalInfoComplete) {
    fulfillmentStatus = 3; // TODO add enum;
  }

  return fulfillmentStatus;
};

export const clearCustomerAnalysisCache = async (customerId: number | string) => {
  await CustomerAnalysis.update(
    {
      requestedAt: null,
    },
    {
      where: {
        customerId,
      },
    },
  );

  return true;
};
