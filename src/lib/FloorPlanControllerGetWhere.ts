import { Sequelize, WhereOptions } from 'sequelize';
import { FLOORPLAN_FILTERS } from '../constants';
import { addCondition } from '../utils/filterUtils';

export default function getWhere({
  filters,
  initialFilter = {},
  accountId,
  authIsDealer,
}: {
  filters: any;
  initialFilter: any;
  accountId: number;
  authIsDealer: boolean;
}) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (authIsDealer) {
    conditions.set('accountId', accountId);
  }

  if (filters) {
    FLOORPLAN_FILTERS.forEach(f => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(initialFilter, Object.fromEntries(conditions));

  return where;
}
