import { NextFunction, Request, Response } from 'express';
import InternalError from '../exceptions/InternalError';
import {
  varsCurrencyExchange,
  varsConstants,
  varsRoutes,
  varsGit,
  varsPackage,
  varsEnv,
  getInventoryStatusList,
  getInventoryActivityTypeList,
  getInventoryTypeList,
  getLeadActivityTypeList,
  getLeadStatusList,
  getQuoteStatusList,
  getScheduleActivityTypeList,
  getScheduleStatusList,
  getScheduleTypeList,
  getVehicleGeneralConditionList,
  getApplicationStatusList,
  getDealerCommissionTable,
} from '../lib/vars';

class CurrencyController {
  async all(_request: Request, response: Response, _next: NextFunction) {
    let res = {};

    try {
      res = {
        ...res,
        version: varsPackage().version,
        package: varsPackage(),
        env: varsEnv(),
      };
    } catch (error) {
      console.log('ERROR ', error);
      // return next(new InternalError(error));
    }

    try {
      const currencyExchange = await varsCurrencyExchange();
      res = {
        ...res,
        currencyExchange,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const inventoryStatus = await getInventoryStatusList();
      res = {
        ...res,
        inventoryStatus,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const inventoryType = await getInventoryTypeList();
      res = {
        ...res,
        inventoryType,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const inventoryActivityType = await getInventoryActivityTypeList();
      res = {
        ...res,
        inventoryActivityType,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const vehicleGeneralCondition = await getVehicleGeneralConditionList();
      res = {
        ...res,
        vehicleGeneralCondition,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const leadActivityType = await getLeadActivityTypeList();
      res = {
        ...res,
        leadActivityType,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const leadStatus = await getLeadStatusList();
      res = {
        ...res,
        leadStatus,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const quoteStatus = await getQuoteStatusList();
      res = {
        ...res,
        quoteStatus,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const scheduleType = await getScheduleTypeList();
      res = {
        ...res,
        scheduleType,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const scheduleStatus = await getScheduleStatusList();
      res = {
        ...res,
        scheduleStatus,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const scheduleActivityType = await getScheduleActivityTypeList();
      res = {
        ...res,
        scheduleActivityType,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    try {
      const git = await varsGit();
      res = {
        ...res,
        git,
      };
    } catch (error) {
      console.log('ERROR', error);
      // return next(new InternalError(error));
    }

    return response.json(res);
  }

  async git(_request: Request, response: Response, next: NextFunction) {
    try {
      const git = await varsGit();
      return response.json(git);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async env(_request: Request, response: Response, next: NextFunction) {
    try {
      const env = await varsEnv();
      return response.json(env);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async package(_request: Request, response: Response, next: NextFunction) {
    try {
      const packageVersion = varsPackage();
      return response.json(packageVersion);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async version(_request: Request, response: Response, next: NextFunction) {
    try {
      const packageVersion = varsPackage();
      return response.json(packageVersion.version);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async currencyExchange(_request: Request, response: Response, next: NextFunction) {
    try {
      const currencyExchange = await varsCurrencyExchange();
      return response.json(currencyExchange);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async constants(_request: Request, response: Response, next: NextFunction) {
    try {
      return response.json(varsConstants());
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async routes(request: Request, response: Response, next: NextFunction) {
    try {
      return response.json(varsRoutes(request.app, {}));
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async check(_request: Request, response: Response, next: NextFunction) {
    // TODO do a method to compare CONSTANTS WITH DB TABLES
    try {
      return response.json({ message: 'OK' });
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async inventoryStatus(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getInventoryStatusList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async inventoryType(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getInventoryTypeList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async inventoryActivityType(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getInventoryActivityTypeList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async vehicleGeneralCondition(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getVehicleGeneralConditionList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async leadActivityType(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getLeadActivityTypeList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async leadStatus(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getLeadStatusList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async quoteStatus(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getQuoteStatusList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async applicationStatus(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getApplicationStatusList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async scheduleType(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getScheduleTypeList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async scheduleStatus(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getScheduleStatusList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async scheduleActivityType(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getScheduleActivityTypeList();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }

  async dealerCommissionTable(_request: Request, response: Response, next: NextFunction) {
    try {
      const res = await getDealerCommissionTable();
      return response.json(res);
    } catch (error) {
      console.log('ERROR', error);
      return next(new InternalError(error));
    }
  }
}

export default CurrencyController;
