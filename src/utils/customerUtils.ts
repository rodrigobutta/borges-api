import { CUSTOMER_FILTERS, CUSTOMER_FILTERS_COMPLEX } from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';

export function getWhereCustomer({ filters }: { filters: any; isDealer: boolean; authAccountId: number }) {
  let where: WhereOptions = {};
  let conditions: Map<any, any> = new Map();

  if (filters) {
    CUSTOMER_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(
    CUSTOMER_FILTERS_COMPLEX.map((f: Filter) => {
      return Sequelize.where(Sequelize.fn('concat', Sequelize.col(f.attr), ' ', Sequelize.col(f.complementAttr)), {
        [Op.substring]: filters[f.name] ?? '',
      });
    }) as any,
    Object.fromEntries(conditions),
  );

  return where;
}
