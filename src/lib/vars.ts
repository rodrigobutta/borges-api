import { Op, Sequelize } from 'sequelize';
import { CurrencyExchange } from '../models/CurrencyExchange';
import InternalError from '../exceptions/InternalError';
import {
  CONSUMER_ACCOUNT_ID,
  PANEL_ACCOUNT_ID,
  CONSUMER_API_USER_ID,
  CHANNELS,
  VEHICLE_CONDITIONS,
  CURRENCIES,
  INVENTORY_STATUS,
  INVENTORY_ACTIVITY_TYPE,
  INVENTORY_TYPE,
  LEAD_ACTIVITY_TYPE,
  QUOTE_STATUS,
  SCHEDULE_TYPE,
  SCHEDULE_STATUS,
  LOAN_APPLICATION_STATUS,
} from '../constants';
import path from 'path';

import { getLastCommit } from 'git-last-commit';
import settings from '../settings';
import { InventoryStatus } from '../models/InventoryStatus';
import { InventoryType } from '../models/InventoryType';
import { InventoryActivityType } from '../models/InventoryActivityType';
import { VehicleGeneralConditions } from '../models/VehicleGeneralConditions';
import { LeadActivityType } from '../models/LeadActivityType';
import { LeadStatus } from '../models/LeadStatus';
import { QuoteStatus } from '../models/QuoteStatus';
import { ScheduleType } from '../models/ScheduleType';
import { ScheduleStatus } from '../models/ScheduleStatus';
import { ScheduleActivityType } from '../models/ScheduleActivityType';
import { LoanApplicationStatus } from '../models/LoanApplicationStatus';
import { DealerCommissionTable } from '../models/DealerCommissionTable';

const defaultOptions = {
  prefix: '',
  spacer: 7,
};

function getPathFromRegex(regexp: { toString: () => string }) {
  return regexp.toString().replace('/^', '').replace('?(?=\\/|$)/i', '').replace(/\\\//g, '/');
}

function combineStacks(acc: any, stack: { handle: { stack: any[] }; regexp: any }) {
  if (stack.handle.stack) {
    const routerPath = getPathFromRegex(stack.regexp);
    return [...acc, ...stack.handle.stack.map((stack: any) => ({ routerPath, ...stack }))];
  }
  return [...acc, stack];
}

const getStacks = (app: {
  routes: { [x: string]: any };
  _router: { stack: any[] };
  stack: any[];
  router: { stack: any[] };
}) => (app._router && app._router.stack ? app._router.stack.reduce(combineStacks, []) : []);

export const varsRoutes = (app: any, opts: any) => {
  const stacks = getStacks(app);
  const options = { ...defaultOptions, ...opts };

  const routes = [];

  if (stacks) {
    for (const stack of stacks) {
      if (stack.route) {
        const routeLogged: any = {};
        for (const route of stack.route.stack) {
          const method: string = route.method ? route.method.toUpperCase() : null;
          if (!routeLogged[method] && method) {
            const stackPath = path.resolve(
              [options.prefix, stack.routerPath, stack.route.path, route.path].filter(s => !!s).join(''),
            );

            routes.push({
              method,
              path: stackPath,
            });

            routeLogged[method] = true;
          }
        }
      }
    }
  }

  return routes;
};

export const varsCurrencyExchange = async () => {
  try {
    const maxIds = await CurrencyExchange.findAll({
      attributes: [[Sequelize.fn('max', Sequelize.col('id')), 'id']],
      group: ['from', 'to'],
    });

    const ids = maxIds.map(result => {
      return result.id;
    });

    const currencyExchange = await CurrencyExchange.findAll({
      attributes: ['from', 'to', 'value', 'createdAt'],
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    return currencyExchange;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const varsConstants = () => {
  return {
    CONSUMER_ACCOUNT_ID,
    PANEL_ACCOUNT_ID,
    CONSUMER_API_USER_ID,
    CHANNELS,
    VEHICLE_CONDITIONS,
    CURRENCIES,
    INVENTORY_STATUS,
    INVENTORY_ACTIVITY_TYPE,
    INVENTORY_TYPE,
    LEAD_ACTIVITY_TYPE,
    QUOTE_STATUS,
    SCHEDULE_TYPE,
    SCHEDULE_STATUS,
    LOAN_APPLICATION_STATUS,
  };
};

export const varsGit = async () => {
  return new Promise((res, rej) => {
    getLastCommit(function (err, commit) {
      if (err) return rej(err);
      return res(commit);
      console.log(commit);
    });
  });
};

export const varsPackage = () => {
  return {
    version: process.env.npm_package_version,
    name: process.env.npm_package_name,
    description: process.env.npm_package_description,
    author: process.env.npm_package_author_name,
  };
};

export const varsEnv = () => {
  const mask = '*****';
  return {
    ...settings,
    auth: {
      ...settings.auth,
      keycloak: {
        ...settings.auth.keycloak,
        secret: mask,
        password: mask,
      },
    },
    mysql: {
      ...settings.mysql,
      PASSWORD: mask,
    },
    s3: {
      ...settings.s3,
      ACCESS_SECRET_KEY: mask,
    },
    mailgun: {
      ...settings.mailgun,
      PRIVATE_API_KEY: mask,
    },
  };
};

export const getInventoryStatusList = async () => {
  try {
    const res = await InventoryStatus.findAll({
      attributes: ['id', 'code', 'name', 'locked', 'searchable'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getInventoryTypeList = async () => {
  try {
    const res = await InventoryType.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getInventoryActivityTypeList = async () => {
  try {
    const res = await InventoryActivityType.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getVehicleGeneralConditionList = async () => {
  try {
    const res = await VehicleGeneralConditions.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getLeadActivityTypeList = async () => {
  try {
    const res = await LeadActivityType.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getLeadStatusList = async () => {
  try {
    const res = await LeadStatus.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getQuoteStatusList = async () => {
  try {
    const res = await QuoteStatus.findAll({
      attributes: ['id', 'code', 'name', 'locked', 'inventorySearchable', 'data', 'autoOnly'],
      where: {
        id: {
          [Op.or]: [30, 40, 43, 47, 48, 49, 50, 51, 52],
        },
      },
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getApplicationStatusList = async () => {
  try {
    const res = await LoanApplicationStatus.findAll({
      attributes: [
        'id',
        'code',
        'name',
        'locked',
        'type',
        'description',
        'canSubmitToDealer',
        'canSubmitToPanel',
        'canSubmitToProvider',
      ],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getScheduleTypeList = async () => {
  try {
    const res = await ScheduleType.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getScheduleStatusList = async () => {
  try {
    const res = await ScheduleStatus.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getScheduleActivityTypeList = async () => {
  try {
    const res = await ScheduleActivityType.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};

export const getDealerCommissionTable = async () => {
  try {
    const res = await DealerCommissionTable.findAll({
      attributes: ['id', 'code', 'name'],
    });

    return res;
  } catch (error) {
    console.log('ERROR', error);
    throw new InternalError(error);
  }
};
