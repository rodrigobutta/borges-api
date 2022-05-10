import { Order } from 'sequelize';

const parseFilters = (input: string) => {
  const parsedObj = JSON.parse(input);

  let salida: { [key: string]: any } = {};

  const objKeys = Object.keys(parsedObj);

  for (let i = 0; i < objKeys.length; i++) {
    const _key = objKeys[i];
    const objContent = parsedObj[_key];
    if (Array.isArray(objContent)) {
      salida[_key] = [];
      objContent.forEach(element => {
        if (element.filterType.toLowerCase() === 'text') {
          salida[_key].push(element.value);
        } else if (element.filterType.toLowerCase() === 'number') {
          salida[_key].push(parseFloat(element.value));
        }
      });
    } else {
      const objInfo = objContent;
      if (objInfo.filterType.toLowerCase() === 'text') {
        salida[_key] = objInfo.value;
      } else if (objInfo.filterType.toLowerCase() === 'number') {
        salida[_key] = parseFloat(objInfo.value);
      } else if (objInfo.filterType.toLowerCase() === 'numberrange') {
        salida[_key] = {
          from: objInfo?.value?.from ? parseFloat(objInfo?.value?.from) : null,
          to: objInfo?.value?.to ? parseFloat(objInfo?.value?.to) : null,
        };
      } else if (objInfo.filterType.toLowerCase() === 'date') {
        salida[_key] = objInfo.value;
      } else if (objInfo.filterType.toLowerCase() === 'daterange') {
        salida[_key] = {
          from: objInfo.value?.from,
          to: objInfo.value?.to,
        };
      }
    }
  }

  return salida;
};

const parseOrFilters = (input: string) => {
  const parsedArr: any[] = JSON.parse(input);

  let salida = parsedArr.map(x => {
    return {
      fields: x.fields,
      value: x.value,
    };
  });

  return salida;
};

const parseSort = (input: any) => {
  if (!Array.isArray(input)) return null;

  const [propertyName, sortDirection] = input as string[];

  if (!propertyName || !sortDirection) return null;

  const splitedPropertyName = propertyName.split('.');

  return [[...splitedPropertyName, sortDirection]] as Order;
};

export const parse = (query: any) => {
  const { limit, page, filters, orFilters, sort } = query;

  const _limit = limit ? parseFloat(limit) : 10;
  const _page = page ? parseFloat(page) : undefined;
  const _filters = filters ? parseFilters(filters) : undefined;
  const _orFilters = orFilters ? parseOrFilters(orFilters) : undefined;
  const _sort = sort ? parseSort(sort) : undefined;

  return {
    page: _page,
    limit: _limit,
    filters: _filters,
    orFilters: _orFilters,
    sort: _sort,
  };
};
