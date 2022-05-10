import { STATE_GRAVAMEN_FILTERS } from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';

export function getWhereStateGravamen({ filters }: { filters: any }) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();
  const { created = 'true' } = filters ?? { created: 'true' };

  if (JSON.parse(String(created))) {
    conditions.set('amount', { [Op.gt]: 0 });
  } else {
    conditions.set('amount', {
      [Op.or]: {
        [Op.is]: null,
        [Op.eq]: 0,
      },
    });
  }

  if (filters) {
    STATE_GRAVAMEN_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(Object.fromEntries(conditions));

  return where;
}
