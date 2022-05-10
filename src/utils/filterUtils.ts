import { Filter } from '../dto/Filter';
import { Op } from 'sequelize';

// TODO
function isEmpty(input: any) {
  if (input === null || input === undefined) {
    return true;
  }

  const inputType = typeof input;

  if (inputType === 'string' && `${input}`.trim() === '') {
    return true;
  }

  if (Array.isArray(input) && input.length === 0) {
    return true;
  }

  return false;
}

export function addCondition(conditions: Map<string, any>, filters: any, f: Filter) {
  if (filters.hasOwnProperty(f.name)) {
    switch (f.type) {
      case Filter.TYPE_RANGE:
        const fromIsEmpty = isEmpty(filters[f.name]['from']);
        const toIsEmpty = isEmpty(filters[f.name]['to']);

        if (
          filters[f.name].hasOwnProperty('from') &&
          filters[f.name].hasOwnProperty('to') &&
          !fromIsEmpty &&
          !toIsEmpty
        ) {
          conditions.set(f.attr, {
            [Op.between]: [filters[f.name]['from'], filters[f.name]['to']],
          });
        } else if (filters[f.name].hasOwnProperty('from') && !fromIsEmpty) {
          conditions.set(f.attr, { [Op.gte]: filters[f.name]['from'] });
        } else if (filters[f.name].hasOwnProperty('to') && !toIsEmpty) {
          conditions.set(f.attr, { [Op.lte]: filters[f.name]['to'] });
        }
        break;
      case Filter.TYPE_TEXT:
        conditions.set(f.attr, { [Op.substring]: filters[f.name] });
        break;
      case Filter.TYPE_VALUE:
        conditions.set(f.attr, { [Op.eq]: filters[f.name] });
        break;
      case Filter.TYPE_NOT_EQUAL:
        conditions.set(f.attr, {
          [Op.or]: {
            [Op.eq]: null,
            [Op.ne]: filters[f.name],
          },
        });
        break;
      case Filter.TYPE_NOT_EQUAL_ARRAY:
        conditions.set(f.attr, {
          [Op.or]: {
            [Op.eq]: null,
            [Op.notIn]: filters[f.name],
          },
        });
        break;
    }
  }
}
