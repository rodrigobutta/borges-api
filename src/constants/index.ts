import { Filter } from '../dto/Filter';

export const CONSUMER_ACCOUNT_ID = 1;
export const PANEL_ACCOUNT_ID = 2;
export const CONSUMER_API_USER_ID = 1;

export const KEYCLOAK_GROUP_PANEL_NAME = 'panel'; // contains keycloak panel roles;
export const KEYCLOAK_GROUP_DEALER_NAME = 'dealer'; // contains keycloak dealers roles;

export const KEYCLOAK_GROUP_PANEL = 'panel'; // contains keycloak panel roles;
export const KEYCLOAK_GROUP_DEALER = 'dealer'; // contains keycloak dealers roles;
export const KEYCLOAK_GROUP_PANEL_ID = '0bc3363c-1de1-4d41-8438-feb6e8c8bd19';
export const KEYCLOAK_GROUP_DEALER_ID = 'd7d1a2b4-663e-4268-9345-8eeec98df02f';

export const CHANNELS: Record<string, string> = Object.freeze({
  'consumer-web': 'CONSUMER_WEB',
  'consumer-app': 'CONSUMER_APP',
  'dealers-web': 'DEALERS_WEB',
  'dealers-app': 'DEALERS_APP',
  'panel-web': 'PANEL_WEB',
});

export const USER_FILTERS: Filter[] = [
  new Filter('licensePlate', Filter.TYPE_TEXT),
  new Filter('makerCountry', Filter.TYPE_TEXT),
  new Filter('year', Filter.TYPE_TEXT),
  new Filter('brand', Filter.TYPE_TEXT),
  new Filter('vehicleBrandName', Filter.TYPE_TEXT),
  new Filter('model', Filter.TYPE_VALUE),
  new Filter('type', Filter.TYPE_TEXT),
  new Filter('vin', Filter.TYPE_TEXT),

  new Filter('statusId', Filter.TYPE_VALUE),
  new Filter('accountId', Filter.TYPE_VALUE),
  new Filter('exclude-array-accountId', Filter.TYPE_NOT_EQUAL_ARRAY, 'accountId'),
  new Filter('floorPlanStatus', Filter.TYPE_VALUE),

  new Filter('email', Filter.TYPE_TEXT),
  new Filter('uuid', Filter.TYPE_TEXT),
  new Filter('firstName', Filter.TYPE_TEXT),
  new Filter('lastName', Filter.TYPE_TEXT),
];

export const ACCOUNT_FILTERS: Filter[] = [new Filter('name', Filter.TYPE_TEXT)];

export const CUSTOMER_FILTERS: Filter[] = [
  new Filter('firstName', Filter.TYPE_VALUE),
  new Filter('lastName', Filter.TYPE_VALUE),
];

export const CUSTOMER_FILTERS_COMPLEX: Filter[] = [new Filter('name', Filter.TYPE_TEXT, 'firstName', 'lastName')];

export const DEFAULT_DEALER_COMMISSION_TABLE_ID = 4;

export const ACCOUNT_GROUP_DEALER = 3;
