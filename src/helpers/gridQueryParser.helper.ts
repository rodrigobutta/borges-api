// import { Order } from 'sequelize';

export const parse = (query: any) => {
  const { limit, page, filters, excludeFilters, orFilters, sort } = query;

  const _limit = parseFloat(limit);
  const _page = parseFloat(page);
  const _filters = parseFilters(filters);
  const _excludeFilters = parseFilters(excludeFilters);
  const _orFilters = parseOrFilters(orFilters);
  const _sort = parseSort(sort);

  return {
    page: _page,
    limit: _limit,
    filters: _filters,
    excludeFilters: _excludeFilters,
    orFilters: _orFilters,
    sort: _sort,
  };
};

const parseFilters = (input: string) => {
  let salida: { [key: string]: any } = {};

  if (!input) {
    return salida;
  }

  const parsedObj = JSON.parse(input);
  const objKeys = Object.keys(parsedObj);

  for (let i = 0; i < objKeys.length; i++) {
    const _key = objKeys[i];
    const objContent = parsedObj[_key];
    if (Array.isArray(objContent)) {
      salida[_key] = [];
      objContent.forEach(element => {
        if (element.filterType.toUpperCase() === 'TEXT') {
          salida[_key].push(element.value);
        } else if (element.filterType === 'NUMBER') {
          salida[_key].push(parseFloat(element.value));
        }
      });
    } else {
      const objInfo = objContent;
      if (objInfo.filterType.toUpperCase() === 'TEXT') {
        salida[_key] = objInfo.value;
      } else if (objInfo.filterType.toUpperCase() === 'NUMBER') {
        salida[_key] = parseFloat(objInfo.value);
      } else if (objInfo.filterType.toUpperCase() === 'NUMBERRANGE') {
        salida[_key] = {
          from: objInfo?.value?.from ? parseFloat(objInfo?.value?.from) : null,
          to: objInfo?.value?.to ? parseFloat(objInfo?.value?.to) : null,
        };
      } else if (objInfo.filterType.toUpperCase() === 'DATE') {
        salida[_key] = objInfo.value;
      } else if (objInfo.filterType.toUpperCase() === 'DATERANGE') {
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
  if (!input) return null;

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

  return [[...splitedPropertyName, sortDirection]] as any;
};
