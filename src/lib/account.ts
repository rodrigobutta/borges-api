import { Op } from 'sequelize';
import { CONSUMER_ACCOUNT_ID, PANEL_ACCOUNT_ID } from '../constants';
import AlreadyExistsException from '../exceptions/AlreadyExistsException';
import ForbiddenException from '../exceptions/ForbiddenException';
import InternalError from '../exceptions/InternalError';
import NotFoundException from '../exceptions/NotFoundException';
import { Account } from '../models/Account';
import { AccountGroupPermission } from '../models/AccountGroupPermission';
import { AccountGroupRole } from '../models/AccountGroupRole';
import { DealerCommissionTable } from '../models/DealerCommissionTable';
import { DealerCommissionTableAssignment } from '../models/DealerCommissionTableAssignment';
import { Inventory } from '../models/Inventory';
import { LoanApplication } from '../models/LoanApplication';
import { Location } from '../models/Location';
import { Quote } from '../models/Quote';
import { Status } from '../models/Status';

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

  const accountId = account.id;

  await Status.bulkCreate([
    {
      accountId,
      name: 'Disponible',
      color: '#33691e',
    },
    {
      accountId,
      name: 'Reservado',
      color: '#795548',
    },
    {
      accountId,
      name: 'Bloqueado',
      color: '#01579b',
    },
    {
      accountId,
      name: 'En preparación',
      color: '#004d40',
    },
    {
      accountId,
      name: 'En tránsito',
      color: '#827717',
    },
    {
      accountId,
      name: 'Vendido',
      color: '#4a148c',
    },
  ]);

  await DealerCommissionTableAssignment.bulkCreate([
    {
      accountId,
      customerAnalysisScore: 'A',
      dealerCommissionTableId: 1,
    },
    {
      accountId,
      customerAnalysisScore: 'A',
      dealerCommissionTableId: 2,
    },
    {
      accountId,
      customerAnalysisScore: 'A',
      dealerCommissionTableId: 3,
    },
    {
      accountId,
      customerAnalysisScore: 'A',
      dealerCommissionTableId: 4,
    },
    {
      accountId,
      customerAnalysisScore: 'A',
      dealerCommissionTableId: 5,
    },
    {
      accountId,
      customerAnalysisScore: 'B',
      dealerCommissionTableId: 1,
    },
    {
      accountId,
      customerAnalysisScore: 'B',
      dealerCommissionTableId: 2,
    },
    {
      accountId,
      customerAnalysisScore: 'B',
      dealerCommissionTableId: 3,
    },
    {
      accountId,
      customerAnalysisScore: 'B',
      dealerCommissionTableId: 4,
    },
    {
      accountId,
      customerAnalysisScore: 'B',
      dealerCommissionTableId: 5,
    },
    {
      accountId,
      customerAnalysisScore: 'C',
      dealerCommissionTableId: 1,
    },
    {
      accountId,
      customerAnalysisScore: 'C',
      dealerCommissionTableId: 2,
    },
    {
      accountId,
      customerAnalysisScore: 'C',
      dealerCommissionTableId: 3,
    },
    {
      accountId,
      customerAnalysisScore: 'C',
      dealerCommissionTableId: 4,
    },
    {
      accountId,
      customerAnalysisScore: 'C',
      dealerCommissionTableId: 5,
    },
    {
      accountId,
      customerAnalysisScore: 'D',
      dealerCommissionTableId: 1,
    },
    {
      accountId,
      customerAnalysisScore: 'D',
      dealerCommissionTableId: 2,
    },
    {
      accountId,
      customerAnalysisScore: 'D',
      dealerCommissionTableId: 3,
    },
    {
      accountId,
      customerAnalysisScore: 'D',
      dealerCommissionTableId: 4,
    },
  ]);

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
  if (account.id === PANEL_ACCOUNT_ID) {
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
  if (accountId === PANEL_ACCOUNT_ID) {
    return false;
  }
  if (accountId === CONSUMER_ACCOUNT_ID) {
    return false;
  }

  return true;
};

export const isConsumerAccount = (accountId: number): boolean => !!(accountId === CONSUMER_ACCOUNT_ID);

export const isPanelAccount = (accountId: number): boolean => !!(accountId === PANEL_ACCOUNT_ID);

export const deleteAccount = async (accountId: number, authIsPanel?: boolean) => {
  try {
    if (!authIsPanel) {
      throw new ForbiddenException();
    }
    if (accountId === CONSUMER_ACCOUNT_ID || accountId === PANEL_ACCOUNT_ID) {
      throw new ForbiddenException('Esta cuenta es de sistema y no puede ser eliminada');
    }

    // get the Account inventory that will be used to find other related entities
    const inventories = await Inventory.findAll({
      attributes: ['id'],
      where: {
        accountId,
      },
      raw: true,
    });
    const inventoryIds = inventories.map(({ id }) => id);

    // check if has Applications open
    const activeLoanApplications = await LoanApplication.findAll({
      where: {
        inventoryId: { [Op.in]: inventoryIds },
      },
      raw: true,
    });
    if (activeLoanApplications.length > 0) {
      throw new ForbiddenException(
        `No se puede eliminar la cuenta porque tiene ${activeLoanApplications.length} aplicaciones activas`,
      );
    }

    // console.log('inventoryIds', inventoryIds);
    // console.log('activeLoanApplications', activeLoanApplications);

    await Quote.destroy({
      where: {
        inventoryId: { [Op.in]: inventoryIds },
      },
    });

    await Inventory.destroy({
      where: {
        accountId,
      },
    });

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
