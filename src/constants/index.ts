import { Filter } from '../dto/Filter';

export const CONSUMER_ACCOUNT_ID = 1;
export const PANEL_ACCOUNT_ID = 2;
export const CONSUMER_API_USER_ID = 1;

export const KEYCLOAK_GROUP_PANEL_NAME = 'panel'; // contains keycloak panel roles;
export const KEYCLOAK_GROUP_DEALER_NAME = 'dealer'; // contains keycloak dealers roles;

export const AUDIT_STATUSES = {
  APPROVED: 'Aprovado',
};

export const FLOOR_PLAN_STATUSES = {
  // incorporation_rejected: "Inclusão Solicitada",
  incorporated: 'Dentro do Floor Plan',
  incorporation_requested: 'Inclusão Solicitada',
  not_incorporated: 'Fora do Floor Plan',
  release_rejected: 'Liberação rejeitada',
  release_requested: 'Liberação solicitada',
  released: 'Liberado',
};

export const SALES_PERSON_BORGES = [
  {
    id: 2,
    value: 'Hermes Fideles Junior',
  },
  {
    id: 1,
    value: 'José Bezerra da Silva Junior',
  },
  {
    id: 3,
    value: 'Marcelo Boer',
  },
];

export const DEALER_COMMISION = {
  BRONCE: 3,
  SILVER: 1,
  GOLD: 2,
};

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

export const VEHICLE_CONDITIONS = [
  {
    id: 'new',
    name: '0KM',
  },
  {
    id: 'used',
    name: 'Usado',
  },
];

export const CURRENCIES = {
  USD: 'USD',
  UYU: 'UYU',
  UYI: 'UI',
  R$: 'R$',
};

export const FLOORPLAN_FILTERS: Filter[] = [
  new Filter('vehiclePriceAmount', Filter.TYPE_RANGE),
  new Filter('mileage', Filter.TYPE_RANGE),
  new Filter('year', Filter.TYPE_RANGE),
  new Filter('assemblyYear', Filter.TYPE_RANGE),
  new Filter('saleValuation', Filter.TYPE_RANGE),

  new Filter('statusId', Filter.TYPE_VALUE),
  new Filter('accountId', Filter.TYPE_VALUE),
  new Filter('floorPlan', Filter.TYPE_VALUE),
  new Filter('new', Filter.TYPE_VALUE),

  new Filter('id', Filter.TYPE_VALUE),
  new Filter('licensePlate', Filter.TYPE_TEXT),
  new Filter('registrationNumber', Filter.TYPE_TEXT),
  new Filter('vehicleBrandName', Filter.TYPE_TEXT),
  new Filter('vehicleModelName', Filter.TYPE_TEXT),
  new Filter('type', Filter.TYPE_TEXT),
  new Filter('color', Filter.TYPE_TEXT),
];

export const QUOTE_FILTER_NAMES = {
  brandModel: ['inventory', 'vehicleName'],
  brandName: ['inventory', 'vehicleBrandName'],
  modelName: ['inventory', 'vehicleModelName'],
  customerFullame: ['lead', 'customer', 'customerName'],
  customerName: ['lead', 'customer', 'firstName'],
  customerLastName: ['lead', 'customer', 'lastName'],
};

export const QUOTE_FILTERS_COMPLEX: Filter[] = [
  new Filter(
    'lead.inventory.inventoryName',
    Filter.TYPE_TEXT,
    'inventory.vehicleBrandName',
    'inventory.vehicleModelName',
  ),
  new Filter('lead.customer.customerName', Filter.TYPE_TEXT, 'lead.customer.firstName', 'lead.customer.lastName'),
  new Filter('user.userFullName', Filter.TYPE_TEXT, 'user.firstName', 'user.lastName'),
];
export const QUOTE_FILTERS: Filter[] = [
  new Filter('id', Filter.TYPE_VALUE),
  new Filter('customerAnalysisScore', Filter.TYPE_VALUE, '$customerAnalysisScore$'),
  new Filter('quoteInstanceId', Filter.TYPE_VALUE, '$quoteInstanceId$'),
  new Filter('amount', Filter.TYPE_RANGE, '$amount$'),
  new Filter('loanMaxAmount', Filter.TYPE_RANGE, '$loanMaxAmount$'),
  new Filter('declaredIncome', Filter.TYPE_RANGE, '$declaredIncome$'),
  new Filter('loanMaxInstallmentAmount', Filter.TYPE_RANGE, '$loanMaxInstallmentAmount$'),
  new Filter('inventorySaleValuation', Filter.TYPE_RANGE, '$inventorySaleValuation$'),
  new Filter('accountId', Filter.TYPE_VALUE, '$lead.accountId$'),
  new Filter('lead.customer.citizenNumber', Filter.TYPE_TEXT, '$lead.customer.citizenNumber$'),
  new Filter('user.account.salesPersonBorges', Filter.TYPE_VALUE, '$user.account.salesPersonBorges$'),
];

export const INVENTORY_FILTER_NAMES = {
  brandModel: 'vehicleName',
  brandName: 'vehicleBrandName',
  modelName: 'vehicleModelName',
  assemblyYear: 'assemblyYear',
};

// export const INVENTORY_FILTERS_COMPLEX: Filter[] = [
//   new Filter(INVENTORY_FILTER_NAMES.brandModel, Filter.TYPE_TEXT, 'vehicleBrandName', 'vehicleModelName'),
// ];

export const INVENTORY_FILTERS: Filter[] = [
  new Filter(INVENTORY_FILTER_NAMES.assemblyYear, Filter.TYPE_RANGE),
  new Filter('id', Filter.TYPE_VALUE),
  new Filter('color', Filter.TYPE_VALUE),
  new Filter('licensePlate', Filter.TYPE_TEXT),
  new Filter('mileage', Filter.TYPE_RANGE),
  new Filter('new', Filter.TYPE_VALUE),
  new Filter('registrationNumber', Filter.TYPE_TEXT),
  new Filter('saveValuation', Filter.TYPE_RANGE),
  new Filter('type', Filter.TYPE_VALUE),
  new Filter('used', Filter.TYPE_NOT_EQUAL, 'new'),
  new Filter('vehicleBrandId', Filter.TYPE_VALUE),
  new Filter('vehicleBrandName', Filter.TYPE_TEXT),
  new Filter('vehicleConditionId', Filter.TYPE_VALUE),
  new Filter('vehicleFamilyId', Filter.TYPE_VALUE),
  new Filter('vehicleModelId', Filter.TYPE_VALUE),
  new Filter('vehicleModelName', Filter.TYPE_TEXT),
  new Filter('vehiclePriceAmount', Filter.TYPE_RANGE),
  new Filter('year', Filter.TYPE_RANGE),

  new Filter('customerId', Filter.TYPE_VALUE),
  new Filter('accountId', Filter.TYPE_VALUE),
  new Filter('locationId', Filter.TYPE_VALUE),
  new Filter('inventoryTypeId', Filter.TYPE_VALUE),
  new Filter('exclude-inventoryTypeId', Filter.TYPE_NOT_EQUAL, 'inventoryTypeId'),
  new Filter('exclude-customerId', Filter.TYPE_NOT_EQUAL, 'customerId'),
  new Filter('inventoryStatusId', Filter.TYPE_VALUE),
  new Filter('exclude-inventoryStatusId', Filter.TYPE_NOT_EQUAL, 'inventoryStatusId'),
  new Filter('exclude-array-inventoryTypeId', Filter.TYPE_NOT_EQUAL_ARRAY, 'inventoryTypeId'),
];

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

export const LEAD_FILTERS: Filter[] = [
  new Filter('id', Filter.TYPE_VALUE),
  // new Filter('customer.cpf', Filter.TYPE_TEXT, '$customer.citizenNumber$'),
  new Filter('customer.analysis.score', Filter.TYPE_VALUE, '$customer.analysis.score$'),
  new Filter('customer.citizenNumber', Filter.TYPE_TEXT, '$customer.citizenNumber$'),
  new Filter('customer.phoneNumber', Filter.TYPE_TEXT, '$customer.phoneNumber$'),
  new Filter('customer.email', Filter.TYPE_TEXT, '$customer.email$'),
  new Filter('customer.firstName', Filter.TYPE_TEXT, '$customer.firstName$'),
  new Filter('customer.lastName', Filter.TYPE_TEXT, '$customer.lastName$'),
];

export const LEAD_FILTERS_COMPLEX: Filter[] = [
  new Filter(
    'firstInteractionUser.userFullName',
    Filter.TYPE_TEXT,
    'firstInteractionUser.firstName',
    'firstInteractionUser.lastName',
  ),
];

export const APPLICATION_FILTER_NAMES = {
  brandModel: ['inventory', 'vehicleName'],
  brandName: ['inventory', 'vehicleBrandName'],
  modelName: ['inventory', 'vehicleModelName'],
};

export const APPLICATION_FILTERS_COMPLEX: Filter[] = [
  new Filter(
    'lead.inventory.inventoryName',
    Filter.TYPE_TEXT,
    'inventory.vehicleBrandName',
    'inventory.vehicleModelName',
  ),
  new Filter('lead.customer.customerName', Filter.TYPE_TEXT, 'lead.customer.firstName', 'lead.customer.lastName'),
];

export const APPLICATION_FILTERS: Filter[] = [
  new Filter('id', Filter.TYPE_VALUE),
  new Filter('lead.customer.citizenNumber', Filter.TYPE_TEXT, '$lead.customer.citizenNumber$'),
  new Filter('inventory.brand', Filter.TYPE_VALUE, '$inventory.brand$'),
  new Filter('inventory.model', Filter.TYPE_VALUE, '$inventory.model$'),
  new Filter('inventory.year', Filter.TYPE_VALUE, '$inventory.year$'),
  new Filter('loanApplicationStatusId', Filter.TYPE_VALUE, '$loanApplicationStatusId$'),
  new Filter('quote.customerAnalysisScore', Filter.TYPE_VALUE, '$quote.customerAnalysisScore$'),
  new Filter('accountId', Filter.TYPE_VALUE, '$lead.accountId$'),
  new Filter('not_in_account', Filter.TYPE_NOT_EQUAL, '$lead.accountId$'),
  new Filter('salesPersonBorges', Filter.TYPE_VALUE, '$lead.account.salesPersonBorges$'),
];

export const ACCOUNT_FILTERS: Filter[] = [
  new Filter('name', Filter.TYPE_TEXT),
  new Filter('salesPersonBorges', Filter.TYPE_VALUE),
];

export const LEAD_COMMENT_FILTERS: Filter[] = [
  new Filter('leadId', Filter.TYPE_VALUE),
  new Filter('userId', Filter.TYPE_VALUE),
];

export const CUSTOMER_FILTERS: Filter[] = [
  new Filter('firstName', Filter.TYPE_VALUE),
  new Filter('lastName', Filter.TYPE_VALUE),
];

export const CUSTOMER_FILTERS_COMPLEX: Filter[] = [new Filter('name', Filter.TYPE_TEXT, 'firstName', 'lastName')];

export const STATE_GRAVAMEN_FILTERS: Filter[] = [
  new Filter('stateCode', Filter.TYPE_TEXT),
  new Filter('stateName', Filter.TYPE_TEXT),
];

export const INVENTORY_STATUS: Record<string, number> = Object.freeze({
  'created': 5,
  'pending-approval': 10,
  'pending-user-updates': 15,
  'published': 30,
  'locked-process': 40,
  'locked-reserved': 45,
  'sold': 50,
  'removed-user': 60,
  'removed-backoffice': 65,
});

export const INVENTORY_ACTIVITY_TYPE: Record<string, number> = Object.freeze({
  'added-with-pendent-request': 10,
  'add-request-approved': 20,
  'add-request-feedback-requested': 25,
  'add-request-feedback-committed': 30,
  'add-request-rejected': 35,
  'quote-created': 50,
  'virtual-quote-created': 55,
  'application-created': 60,
  'sold': 100,
});

export const INVENTORY_TYPE: Record<string, number> = Object.freeze({
  'simulation': 5,
  'dealer-stock': 10,
  'dealer-virtual': 15,
  'private-stock': 20,
  'private-virtual': 25,
  'external-mercadolibre': 30,
});

export const LEAD_ACTIVITY_TYPE: Record<string, number> = Object.freeze({
  'consumer-register-new-customer': 1,
  'interaction': 2,
  'consumer-register-existing-customer': 6,
  'customer-update-information': 7,
  'customer-fulfillment-complete': 8,
  'user-created': 9,
  'user-requests-buy': 10,
  'user-requests-visit': 11,
  'user-creates-quote': 12,
  'consumer-inventory-add-request': 30,
  'consumer-inventory-add-request-approved': 32,
  'consumer-inventory-add-request-rejected': 34,
  'consumer-inventory-add-request-feedback': 36,
  'consumer-inventory-needs-update': 38,
  'lead-status-update': 50,
  'user-creates-virtual-quote': 60,
  'user-creates-simulation': 70,
});

export enum QUOTE_STATUS {
  'purchase-requested' = 20,
  'purchase-ongoing' = 22,
  'purchase-canceled' = 24,
  'purchase-completed' = 26,
  'canceled' = 30,
  'not-interested-vehicle-bad-status' = 31,
  'not-interested-installment-amount' = 32,
  'not-interested-loan-amount' = 33,
  'not-interested-anymore' = 34,
  'analysis-requested' = 40,
  'analysis-approved-verification' = 43,
  'analysis-approved' = 47,
  'analysis-error' = 48,
  'analysis-rejected' = 49,
  'analysis-rejected-manage' = 50,
  'quote-accepted' = 51,
}

export enum SCHEDULE_TYPE {
  'vehicle-visit' = 10,
}

export enum SCHEDULE_STATUS {
  'requested' = 10,
}

export enum VEHICLE_GENERAL_CONDITIONS {
  'poor' = 5,
  'fair' = 10,
  'good' = 15,
  'excellent' = 20,
}

export enum APPLICATION_STATUS {
  'canceled' = 30,
  'created' = 40,
  'in-progress' = 50,
  'under-review' = 60,
  'with-revisions' = 70,
  'rejected' = 80,
  'approved' = 90,
}

export enum APPLICATION_STATUS_REASON {
  'no-reason' = 0,
  'canceled-vehicle-too-expensive' = 10,
  'canceled-vehicle-bad-status' = 11,
  'canceled-installment-amount' = 12,
  'canceled-loan-amount' = 13,
  'canceled-not-interested' = 14,
  'canceled-expired' = 15,
}

export enum LOAN_APPLICATION_STATUS {
  'canceled' = 30,
  'created' = 40,
  'in-progress' = 50,
  'under-review' = 60,
  'with-revisions' = 70,
  'rejected' = 80,
  'approved' = 90,
  'panel-with-revisions' = 95,
  'qit-contains_errors' = 101,
  'qit-unknown' = 102,
  'qit-rejected' = 103,
  'qit-approved' = 105,
  'qit-feedback' = 106,
  'qit-disbs_error' = 107,
  'qit-disbursement_date_set' = 108,
  'qit-waiting_signature' = 109,
  'qit-signature_finished' = 110,
  'qit-compliance_check' = 111,
  'qit-signature_rejected' = 114,
  'qit-compliance_accepted' = 115,
  'qit-compliance_rejected' = 116,
  'qit-canceled' = 117,
  'qit-disbursed' = 118,
  'qit-settled' = 119,
}

export enum LOAN_APPLICATION_STATUS_REASON {
  'no-reason' = 0,
  'canceled-vehicle-too-expensive' = 10,
  'canceled-vehicle-bad-status' = 11,
  'canceled-installment-amount' = 12,
  'canceled-loan-amount' = 13,
  'canceled-not-interested' = 14,
  'canceled-expired' = 15,
}

export const CUSTOMER_ANALYSIS_SCORES = [
  {
    code: 'A',
    name: 'A',
  },
  {
    code: 'B',
    name: 'B',
  },
  {
    code: 'C',
    name: 'C',
  },
  {
    code: 'D',
    name: 'D',
  },
  {
    code: 'F',
    name: 'F',
  },
];

export const DEFAULT_DEALER_COMMISSION_TABLE_ID = 4;
