import {
  INVENTORY_FILTERS,
  // , INVENTORY_FILTERS_COMPLEX
} from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';
import { Inventory } from '../models/Inventory';
import { InventorySnapshot } from '../models/InventorySnapshot';

export function getWhereInventory({
  filters,
  pLeadId = null,
  pCustomerId = null,
  isDealer,
  authAccountId,
}: {
  filters: any;
  pLeadId?: number | null | undefined;
  pCustomerId?: number | null | undefined;
  isDealer: boolean;
  authAccountId: number;
}) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();
  if (pLeadId) {
    conditions.set('id', {
      [Op.notIn]: Sequelize.literal(`
            (
              Select q.inventoryId 
              from consumerLoanRequests as q 
              left outer join quoteInstances qi 
                on qi.id = q.quoteInstanceId 
              where q.leadId = ${pLeadId} 
                and (
                  qi.code is null 
                  or qi.inventorySearchable = 0
                )
            )`),
    });
  } else if (pCustomerId) {
    conditions.set('id', {
      [Op.notIn]: Sequelize.literal(`
            (
              Select q.inventoryId 
              from consumerLoanRequests as q 
              inner join leads as l 
                on q.leadId = l.id 
              left outer join quoteInstances qi 
                on qi.id = q.quoteInstanceId 
              where l.customerId = ${pCustomerId} 
                and (
                  qi.code is null 
                  or qi.inventorySearchable = 0
                )
            )`),
    });
  }

  if (pLeadId) {
    // customer filter
    conditions.set('customerId', {
      [Op.or]: {
        [Op.is]: null,
        // [Op.in]: Sequelize.literal(`(Select l.customerId from leads l where l.id = ${pLeadId})`),
      },
    });
  } else if (pCustomerId) {
    // customer filter
    conditions.set('customerId', {
      [Op.or]: {
        [Op.is]: null,
        // [Op.eq]: pCustomerId
      },
    });
  }

  if (isDealer) {
    conditions.set('accountId', authAccountId);
  }

  if (filters) {
    INVENTORY_FILTERS.forEach((f: Filter) => {
      if (filters[f.name] !== '' && !!filters[f.name]) {
        addCondition(conditions, filters, f);
      }
    });
  }

  where = Sequelize.and(
    // INVENTORY_FILTERS_COMPLEX.map((f: Filter) => {
    //   return Sequelize.where(
    //     Sequelize.fn(
    //       "concat",
    //       Sequelize.col(f.attr),
    //       " ",
    //       Sequelize.col(f.complementAttr)
    //     ),
    //     {
    //       [Op.substring]: filters[f.name] ?? "",
    //     }
    //   );
    // }) as any,
    Object.fromEntries(conditions),
  );

  return where;
}

export async function createInventorySnapshot(inventory: Inventory): Promise<InventorySnapshot | null> {
  let inventorySnapshotObject: any = { ...inventory.toJSON() };
  inventorySnapshotObject.inventoryId = inventorySnapshotObject.id;
  delete inventorySnapshotObject.id;
  delete inventorySnapshotObject.createdAt;
  delete inventorySnapshotObject.updatedAt;
  delete inventorySnapshotObject.deletedAt;
  try {
    const inventorySnapshot = await InventorySnapshot.create({
      ...inventorySnapshotObject,
    });
    return inventorySnapshot;
  } catch (error) {
    console.log('ERROR', error);
    return null;
  }
}

export async function refreshInventorySnapshot(
  oldInventorySnapshot: InventorySnapshot,
): Promise<InventorySnapshot | null> {
  try {
    const inventory = await Inventory.findOne({
      where: {
        id: oldInventorySnapshot.inventoryId,
      },
    });

    let inventorySnapshotObject: any = { ...inventory?.toJSON() };
    inventorySnapshotObject.inventoryId = inventorySnapshotObject.id;
    delete inventorySnapshotObject.id;
    delete inventorySnapshotObject.createdAt;
    delete inventorySnapshotObject.updatedAt;
    delete inventorySnapshotObject.deletedAt;

    await InventorySnapshot.update(
      {
        ...inventorySnapshotObject,
      },
      {
        where: {
          id: oldInventorySnapshot.id,
        },
      },
    );

    const inventorySnapshot = await InventorySnapshot.findOne({
      where: {
        id: oldInventorySnapshot.id,
      },
    });

    return inventorySnapshot;
  } catch (error) {
    console.log('ERROR', error);
    return null;
  }
}
