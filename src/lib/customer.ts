import { Customer } from '../models/Customer';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { CustomerFulfillmentStatus } from '../models/CustomerFulfillmentStatus';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';

import InternalError from '../exceptions/InternalError';

export const customerResponse = (customer: any) => ({
  ...customer,
});

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
