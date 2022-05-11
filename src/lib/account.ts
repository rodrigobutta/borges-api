import { CONSUMER_ACCOUNT_ID, ADMIN_ACCOUNT_ID } from '../constants';
import AlreadyExistsException from '../exceptions/AlreadyExistsException';
import ForbiddenException from '../exceptions/ForbiddenException';
import InternalError from '../exceptions/InternalError';
import NotFoundException from '../exceptions/NotFoundException';
import { Account } from '../models/Account';
import { AccountGroupPermission } from '../models/AccountGroupPermission';
import { AccountGroupRole } from '../models/AccountGroupRole';
import { DealerCommissionTable } from '../models/DealerCommissionTable';
import { DealerCommissionTableAssignment } from '../models/DealerCommissionTableAssignment';
import { Location } from '../models/Location';

export interface DealerTableAssignation {
  customerAnalysisScore: string;
  tables: string[];
}

export const createAccount = async ({
  companyIDNumber,
  name,
  accountGroupId,
  city,
  state,
  zipCode,
}: {
  companyIDNumber: string;
  name: string;
  accountGroupId: number;
  city?: string;
  state?: string;
  zipCode?: string;
}) => {
  const [account, wasCreated] = await Account.findOrCreate({
    where: {
      companyIDNumber: companyIDNumber,
    },
    defaults: {
      name,
      legalName: name,
      city: city,
      state: state,
      accountGroupId,
    },
    raw: true,
    nest: true,
  });
  if (!wasCreated) {
    throw new AlreadyExistsException(`Una cuenta con ID ${companyIDNumber} ya existe`);
  }

  await Location.create({
    name: 'Principal',
    accountId: account.id,
    zipCode,
    isPointOfSale: true,
  });

  return account;
};

export const getAccountOrigin = (account: Account) => {
  if (account.mlSellerId) {
    return 'MercadoLibre';
  }
  if (account.id === ADMIN_ACCOUNT_ID) {
    return 'Perfil: Backoffice';
  }
  if (account.id === CONSUMER_ACCOUNT_ID) {
    return 'Perfil: Consumer';
  }

  return 'Dealer';
};

export const getAccountGroupRoles = async (accountGroupId: number) => {
  const accountGroupRoles = await AccountGroupRole.findAll({
    attributes: ['id', 'code', 'name'],
    where: {
      accountGroupId,
    },
    raw: true,
    nest: true,
  });

  return accountGroupRoles;
};

export const getAccountGroupPermissions = async (accountGroupId: number) => {
  const accountGroupPermissions = await AccountGroupPermission.findAll({
    attributes: ['id', 'code', 'name'],
    where: {
      accountGroupId,
    },
    raw: true,
    nest: true,
  });

  return accountGroupPermissions;
};

export const isDealerAccount = (accountId: number): boolean => {
  if (accountId === ADMIN_ACCOUNT_ID) {
    return false;
  }
  if (accountId === CONSUMER_ACCOUNT_ID) {
    return false;
  }

  return true;
};

export const isConsumerAccount = (accountId: number): boolean => !!(accountId === CONSUMER_ACCOUNT_ID);

export const isPanelAccount = (accountId: number): boolean => !!(accountId === ADMIN_ACCOUNT_ID);

export const deleteAccount = async (accountId: number, authIsAdmin?: boolean) => {
  try {
    if (!authIsAdmin) {
      throw new ForbiddenException();
    }
    if (accountId === CONSUMER_ACCOUNT_ID || accountId === ADMIN_ACCOUNT_ID) {
      throw new ForbiddenException('Esta cuenta es de sistema y no puede ser eliminada');
    }

    await Account.destroy({
      where: {
        id: accountId,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    throw new InternalError(error);
  }
};

export const patchDealerCommissionTableAssignations = async (
  accountId: number | string,
  assignations: DealerTableAssignation[],
) => {
  const dealerCommissionTables = await DealerCommissionTable.findAll({
    attributes: ['code', 'id'],
    raw: true,
  });

  if (!dealerCommissionTables) {
    throw new NotFoundException("Couldn't find any commission tables");
  }

  try {
    const assignmentBulkInsert = assignations.reduce((acc, k) => {
      const tables = k.tables.map(t => ({
        accountId,
        customerAnalysisScore: k.customerAnalysisScore,
        dealerCommissionTableId: dealerCommissionTables.find(({ code }) => code === t)?.id, // TODO check for table not found
      }));

      return [...acc, ...tables];
    }, [] as any);

    await DealerCommissionTableAssignment.destroy({
      where: {
        accountId,
      },
    });

    await DealerCommissionTableAssignment.bulkCreate(assignmentBulkInsert);
  } catch (error) {
    console.log(error);
    throw new InternalError();
  }

  return true;
};
