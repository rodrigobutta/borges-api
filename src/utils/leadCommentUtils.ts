import { LEAD_COMMENT_FILTERS } from '../constants';
import { Filter } from '../dto/Filter';
import { Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';

export function getWhereLeadComment(filters: any) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (filters) {
    LEAD_COMMENT_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(Object.fromEntries(conditions));

  return where;
}
