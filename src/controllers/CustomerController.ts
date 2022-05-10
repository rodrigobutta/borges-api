import { NextFunction, Request, Response } from 'express';
import { pick } from 'lodash';
import { Customer } from '../models/Customer';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import CustomerUpdateException from '../exceptions/CustomerUpdateException';

import { calcCustomerFulfillmentStatus, getCustomerById, clearCustomerAnalysisCache } from '../lib/customer'; // pruebasApiBot add customerByCpf

import ProfileNotFoundException from '../exceptions/ProfileNotFoundException';
import BadRequestException from '../exceptions/BadRequestException';
import { GridQueryParser } from '../helpers';
import { getWhereCustomer } from '../utils/customerUtils';

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
}

export default CustomerController;
