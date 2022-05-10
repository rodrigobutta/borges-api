import { NextFunction, Request, Response } from 'express';
import LocationArgumentMissingException from '../exceptions/LocationArgumentMissingException';
import LocationException from '../exceptions/LocationException';
import { Location } from '../models/Location';

class LocationController {
  async get(request: Request, response: Response, next: NextFunction) {
    try {
      const { authAccountId } = request;
      if (!authAccountId) return next(new LocationArgumentMissingException());
      const locations = await Location.findAll({
        where: {
          accountId: request.query?.accountId || authAccountId,
          isPointOfSale: true,
        },
        raw: true,
        order: [['id', 'asc']],
      });
      return response.status(200).send(locations);
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }

  async search(request: Request, response: Response, next: NextFunction) {
    try {
      const { authAccountId } = request;
      if (!authAccountId) return next(new LocationArgumentMissingException());

      const { qt } = request.query;

      if (qt === 'select') {
        const locations = await Location.findAll({
          where: {
            accountId: authAccountId,
            isPointOfSale: true,
          },
          raw: true,
          order: [['id', 'asc']],
        });
        return response.status(200).send(locations);
      } else {
        const locations = await Location.findAndCountAll({
          where: {
            accountId: authAccountId,
            isPointOfSale: true,
          },
          raw: true,
          order: [['id', 'asc']],
        });
        return response.status(200).send(locations);
      }
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }

  async add(request: Request, response: Response, next: NextFunction) {
    try {
      const { authAccountId } = request;
      if (!authAccountId) return next(new LocationArgumentMissingException());

      const location = await Location.create({
        ...request.body,
        accountId: authAccountId,
        isPointOfSale: true,
      });
      return response.status(200).send(location);
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }

  async getById(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      if (!id) return next(new LocationArgumentMissingException());

      const locations = await Location.findByPk(id, {
        nest: true,
        raw: true,
      });
      return response.status(200).send(locations);
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      if (!id) return next(new LocationArgumentMissingException());

      const updateResponse = await Location.update(request.body, {
        where: {
          id: id,
        },
      });
      return response.status(200).send(updateResponse);
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      if (!id) return next(new LocationArgumentMissingException());
      await Location.destroy({
        where: {
          id: id,
        },
      });

      return response.status(200).send({
        message: 'Removido',
      });
    } catch (error) {
      console.log('error in location controller: ', error);
      return next(new LocationException());
    }
  }
}

export default LocationController;
