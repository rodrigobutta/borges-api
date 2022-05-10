import { LEAD_FILTERS, LEAD_FILTERS_COMPLEX } from '../constants';
import { Filter } from '../dto/Filter';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';
import BadRequestException from '../exceptions/BadRequestException';

export function getWhereLead({
  filters,
  isDealer = false,
  authAccountId,
}: {
  filters: any;
  isDealer: boolean;
  authAccountId: string;
}) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (isDealer) {
    conditions.set('accountId', authAccountId);
  }

  if (filters) {
    LEAD_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  const complex = LEAD_FILTERS_COMPLEX.filter((f: Filter) => !!filters[f.name]).map((f: Filter) => {
    return Sequelize.where(Sequelize.fn('concat', Sequelize.col(f.attr), ' ', Sequelize.col(f.complementAttr)), {
      [Op.substring]: filters[f.name] ?? '',
    });
  }) as any;

  where = Sequelize.and(complex, Object.fromEntries(conditions));

  return where;
}

export function validateFieldsRequired(body: any) {
  const errors: string[] = [];
  const { citizenNumber, email, firstName, jobType = 1, declaredIncome, lastName, phoneNumber } = body;

  if (!citizenNumber) {
    errors.push('citizenNumber');
  }
  if (!email) {
    errors.push('email');
  }
  if (!firstName) {
    errors.push('firstName');
  }
  if (!jobType) {
    errors.push('jobType');
  }
  if (!declaredIncome) {
    errors.push('declaredIncome');
  }
  if (!lastName) {
    errors.push('lastName');
  }
  if (!phoneNumber) {
    errors.push('phoneNumber');
  }

  if (errors.length > 0) {
    throw new BadRequestException(`Preencha os campos obrigatórios ${errors.join(',')}`);
  }
}
