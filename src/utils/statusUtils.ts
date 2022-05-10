import { Model } from 'sequelize-typescript';
import { LoanApplicationStatus } from '../models/LoanApplicationStatus';
import { LoanApplicationStatusReason } from '../models/LoanApplicationStatusReason';

// import { Quote } from '../models/Quote';
import { QuoteStatus } from '../models/QuoteStatus';
import { QuoteStatusReason } from '../models/QuoteStatusReason';

// import { Inventory } from '../models/Inventory';
import { InventoryStatus } from '../models/InventoryStatus';

// Utils
const getAvailableStatus = async (model: typeof Model) => {
  switch (model) {
    // Status
    case LoanApplicationStatus:
      return await LoanApplicationStatus.findAll();
    case QuoteStatus:
      return await QuoteStatus.findAll();
    case InventoryStatus:
      return await InventoryStatus.findAll();
    // Status reasons
    case LoanApplicationStatusReason:
      return await LoanApplicationStatusReason.findAll();
    case QuoteStatusReason:
      return await QuoteStatusReason.findAll();
    default:
      throw new Error('Must define a model type');
  }
};

export const checkIsValidIdOrCode = async ({
  // checks for status entities with structure {id, code, ...}
  model,
  id,
  code,
}: {
  model: typeof Model;
  id?: number;
  code?: string;
}) => {
  const availableStatus = await getAvailableStatus(model); // get all statuses from DB
  if (id !== undefined) {
    return availableStatus?.map(x => x.id).includes(id); // true if valid
  } else if (code !== undefined) {
    return availableStatus?.map(x => x.code).includes(code); // true if valid
  }
};

export const getStatusIdFromStatusCode = async (model: typeof Model, code: string) => {
  const availableStatus = await getAvailableStatus(model);
  const pairCodeIds = availableStatus.map(x => {
    return [x.code, x.id];
  });
  const foundPair = pairCodeIds.find(x => x[0] === code);
  const foundId = foundPair ? foundPair[1] : null;

  return foundId;
};
