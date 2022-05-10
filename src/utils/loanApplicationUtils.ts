import { APPLICATION_FILTERS, APPLICATION_FILTERS_COMPLEX } from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';
import { Person } from '../models/Person';
import { phoneParser } from '../lib/phoneNumberParser';

export function getWhereApplication({
  filters,
  isDealer,
  authAccountId,
}: {
  filters: any;
  isDealer: boolean;
  authAccountId: number;
}) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (isDealer) {
    conditions.set('$lead.accountId$', authAccountId);
  }

  if (filters) {
    APPLICATION_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  const complex = APPLICATION_FILTERS_COMPLEX.filter((f: Filter) => !!filters[f.name]).map((f: Filter) => {
    return Sequelize.where(Sequelize.fn('concat', Sequelize.col(f.attr), ' ', Sequelize.col(f.complementAttr)), {
      [Op.substring]: filters[f.name] ?? '',
    });
  }) as any;

  where = Sequelize.and(complex, Object.fromEntries(conditions));

  return where;
}

export function parsedPhone(person: Person) {
  return phoneParser(person.homePhone || person.cellPhone);
}

export function parsedRebates(fees: any[]) {
  return fees.map((r: any) => ({
    fee_type: r.fee_type,
    amount_type: r.amount_type,
    amount: r.amount,
  }));
}
