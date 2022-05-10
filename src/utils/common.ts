import _ from 'lodash';
import { APPLICATION_FILTER_NAMES, INVENTORY_FILTER_NAMES, QUOTE_FILTER_NAMES } from '../constants';

export const stripName = (fullname: string) => {
  const nameParts = fullname.split(/\s+/) || [];

  let firstName = null;
  let lastName = null;

  if (nameParts.length >= 4) {
    firstName = `${nameParts[0]} ${nameParts[1]}`;
    lastName = `${nameParts[2]} ${nameParts[3]}`;
  } else if (nameParts.length === 3) {
    firstName = `${nameParts[0]} ${nameParts[1]}`;
    lastName = `${nameParts[2]}`;
  } else if (nameParts.length === 2) {
    firstName = `${nameParts[0]}`;
    lastName = `${nameParts[1]}`;
  } else if (nameParts.length === 1) {
    firstName = `${nameParts[0]}`;
  }

  return {
    firstName,
    lastName,
  };
};

export const valueExistsInArray = (array: any, value: string | number) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) return true;
  }
  return false;
};

export const checkIfValidUUID = (uuid: string) => {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(uuid);
};

export const deleteKeyIfNull = <T>({ entity }: { entity: T }) => {
  (Object.keys(entity) as Array<keyof T>).forEach(key => {
    if (_.isEmpty(entity[key])) {
      delete entity[key];
    }
  });
};

const INVENTORY_BRAND_MODEL_SORT = [INVENTORY_FILTER_NAMES.brandName, INVENTORY_FILTER_NAMES.modelName];
const BRAND_MODEL_SORT = [APPLICATION_FILTER_NAMES.brandName, APPLICATION_FILTER_NAMES.modelName];
const CUSTOMER_NAME_SORT = [QUOTE_FILTER_NAMES.customerName, QUOTE_FILTER_NAMES.customerLastName];

export const createSort = (pSort: any = []) => {
  if (!pSort || !Array.isArray(pSort[0])) {
    return pSort ?? [['id', 'DESC']];
  }

  let sortDirection = (pSort[0] as []).pop();
  const propertyName = pSort[0].length > 1 ? (pSort[0] as []).join('.') : pSort[0].join('.');
  pSort[0].push(sortDirection);
  let sort: any[] = pSort;

  if (!!propertyName) {
    switch (propertyName) {
      case INVENTORY_FILTER_NAMES.brandModel:
        sort = INVENTORY_BRAND_MODEL_SORT.map(v => [v, sortDirection]);
        break;
      case APPLICATION_FILTER_NAMES.brandModel.join('.'):
        sort = BRAND_MODEL_SORT.map(v => [...v, sortDirection]);
        break;
      case QUOTE_FILTER_NAMES.customerFullame.join('.'):
        sort = CUSTOMER_NAME_SORT.map(v => [...v, sortDirection]);
        break;
    }
  }

  return sort;
};

export const isValidJson = (whatever: string) => {
  if (typeof whatever === 'object') {
    return true;
  }

  try {
    JSON.parse(whatever);
  } catch (_e) {
    return false;
  }
  return true;
};

export const capitalizeString = (str: string) => {
  const arr = str.split(' ');

  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }

  return arr.join(' ');
};

export const getJson = (whatever: any) => {
  if (typeof whatever === 'object') {
    return whatever;
  }

  try {
    const parsed = JSON.parse(whatever);
    return parsed;
  } catch (_e) {
    return { error: 'getJson: Cannot parse' };
  }
};
