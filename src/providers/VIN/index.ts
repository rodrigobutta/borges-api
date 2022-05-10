const countries = require('./data/countries').countries;
const manufacturers = require('./data/manufacturers').manufacturers;

const valuesForSecurity: Map<String, number> = new Map([
  ['A', 1],
  ['B', 2],
  ['C', 3],
  ['D', 4],
  ['E', 5],
  ['F', 6],
  ['G', 7],
  ['H', 8],
  ['J', 1],
  ['K', 2],
  ['L', 3],
  ['M', 4],
  ['N', 5],
  ['P', 7],
  ['R', 9],
  ['S', 2],
  ['T', 3],
  ['U', 4],
  ['V', 5],
  ['W', 6],
  ['X', 7],
  ['Y', 8],
  ['Z', 9],
]);

const weightsForSecurity: Map<number, number> = new Map([
  [0, 8],
  [1, 7],
  [2, 6],
  [3, 5],
  [4, 4],
  [5, 3],
  [6, 2],
  [7, 10],
  [8, 0],
  [9, 9],
  [10, 8],
  [11, 7],
  [12, 6],
  [13, 5],
  [14, 4],
  [15, 3],
  [16, 2],
]);

const validateSecurityCode = (vin: any[]) => {
  const SECURITY_CODE = 8;
  let SECURITY_DIGIT = vin[SECURITY_CODE];
  if (SECURITY_DIGIT === 'X') {
    SECURITY_DIGIT = 10;
  }
  //const vinWithNoSecurityCode = vin.substring(0, 8) + vin.substring(9);
  const vinWithNoSecurityCode = vin;
  let product = 0;
  for (let i: number = 0; i < vinWithNoSecurityCode.length; i++) {
    let value: number = isNaN(vinWithNoSecurityCode[i])
      ? valuesForSecurity.get(vinWithNoSecurityCode[i])
      : vinWithNoSecurityCode[i];
    let weight = weightsForSecurity.get(i) ?? 0;
    product += value * weight;
  }
  const result = product % 11;
  return result === SECURITY_DIGIT;
};

const validate = (vin: any) => {
  if (vin.length === 0) return false;

  if (vin.length !== 17) return false;

  return validateSecurityCode(vin);
};

const split = function (vin: string) {
  const INDEXES = {
    MADE_IN_START: 0,
    MADE_IN_END: 2,
    MANUFACTURER_START: 0,
    MANUFACTURER_END: 3,
    DETAILS_START: 3,
    DETAILS_END: 8,
    SECURITY_CODE: 8,
    YEAR: 9,
    ASSEMBLY_PLANT: 10,
    SERIAL_NUMBER_START: 11,
  };

  return {
    madeIn: vin.substring(INDEXES.MADE_IN_START, INDEXES.MADE_IN_END),
    manufacturer: vin.substring(INDEXES.MANUFACTURER_START, INDEXES.MANUFACTURER_END),
    details: vin.substring(INDEXES.DETAILS_START, INDEXES.DETAILS_END),
    securityCode: vin.charAt(INDEXES.SECURITY_CODE),
    year: decodeYear(vin.charAt(INDEXES.YEAR)),
    assemblyPlant: vin.charAt(INDEXES.ASSEMBLY_PLANT),
    serialNumber: vin.substring(INDEXES.SERIAL_NUMBER_START),
  };
};

const decodeYear = (code: string) => {
  const yearCodes = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R',
    'S',
    'T',
    'V',
    'W',
    'X',
    'Y',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ];
  const now = new Date();
  const currentYear = now.getFullYear();

  const yearOffset = yearCodes.indexOf(code);

  if (yearOffset === -1) {
    return [];
  }

  const possibleYears = [2010 + yearOffset, 1980 + yearOffset];

  if (possibleYears[1] > currentYear) {
    return [possibleYears[1]];
  }
  if (possibleYears[0] > currentYear) {
    return [possibleYears[1]];
  }
  return possibleYears;
};

const lookup = (keyName: string, key: string, elements: any[]) => {
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    if (element[keyName] === key) return element;
  }

  return '';
};

const getCountry = (countryCode: string) => {
  const country = lookup('code', countryCode, countries);
  return country.name;
};

const getManufacturer = function (manufacturerCode: string) {
  const manufacturer = lookup('code', manufacturerCode, manufacturers);
  return manufacturer.name;
};

const decode = (vin: string) => {
  const codeValues = split(vin);

  return {
    country: getCountry(codeValues.madeIn),
    details: codeValues.details,
    serialNumber: codeValues.serialNumber,
    year: codeValues.year,
    Make: getManufacturer(codeValues.manufacturer),
  };
};

// module.exports = { validate, split, decode };
export = { validate, split, decode };
