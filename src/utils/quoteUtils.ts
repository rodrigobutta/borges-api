import { QUOTE_FILTERS, QUOTE_FILTERS_COMPLEX } from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';

export function getWhereQuote({
  filters,
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
  if (isDealer) {
    conditions.set('$lead.accountId$', authAccountId);
  }

  if (filters) {
    QUOTE_FILTERS.forEach((f: Filter) => {
      if (filters[f.name] !== '' && !!filters[f.name]) {
        addCondition(conditions, filters, f);
      }
    });
  }

  where = Sequelize.and(
    QUOTE_FILTERS_COMPLEX.map((f: Filter) => {
      return Sequelize.where(Sequelize.fn('concat', Sequelize.col(f.attr), ' ', Sequelize.col(f.complementAttr)), {
        [Op.substring]: filters[f.name] ?? '',
      });
    }) as any,
    Object.fromEntries(conditions),
  );

  return where;
}
