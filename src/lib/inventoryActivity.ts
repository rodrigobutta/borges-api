import { CONSUMER_ACCOUNT_ID, CONSUMER_API_USER_ID } from '../constants';
import { InventoryActivity } from '../models/InventoryActivity';

export const newInventoryActivity: any = async ({
  activityTypeId,
  inventoryId,
  userId = null,
  accountId = null,
  data = null,
}: {
  activityTypeId: number;
  inventoryId: number;
  userId?: number | null;
  accountId?: number | null;
  data?: any | null;
}) => {
  const realAccountId = accountId || CONSUMER_ACCOUNT_ID;
  const realUserId = userId || CONSUMER_API_USER_ID;

  await InventoryActivity.create({
    inventoryId,
    inventoryActivityTypeId: activityTypeId,
    userId: realUserId,
    accountId: realAccountId,
    data,
  });

  return true;
};
