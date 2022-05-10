import { USER_FILTERS } from '../constants';
import { Filter } from '../dto/Filter';
import { Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';

export const fullName = (user: any) => user.firstName + ' ' + user.lastName;

export function getWhereUser(filters: any) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (filters) {
    USER_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(Object.fromEntries(conditions));

  return where;
}
