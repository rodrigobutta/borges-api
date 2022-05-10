// import parsePhoneNumber from "libphonenumber-js";
// const { parsePhoneNumber } = require("libphonenumber-js");

import { parsePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js';

export function phoneParser(phoneNumberUnparsed?: string | null) {
  if (!phoneNumberUnparsed) {
    return {
      country: 'Invalid',
      area: 'Invalid',
      phone: 'Invalid',
      isValid: false,
    };
  }
  // This function receives a complete phone number with or without "+"
  // (eg: +541124535678) and parses Country, Area and Number.
  var phoneNumberAux = phoneNumberUnparsed;
  phoneNumberAux.charAt(0) != '+' && (phoneNumberAux = '+' + phoneNumberAux);

  const phoneNumberParsed = parsePhoneNumber(phoneNumberAux);
  let intlPhoneNumber = phoneNumberParsed.formatInternational();
  const ctry = intlPhoneNumber.split(' ')[0].substring(1); // If "+" sign is needed, remove substring.;
  let acode = '011';
  let ph = '12345678';

  if (phoneNumberParsed.country === 'BR' && validatePhoneNumberLength(phoneNumberUnparsed) === 'INVALID_COUNTRY') {
    acode = intlPhoneNumber.substring(4, 6);
    ph = phoneNumberParsed.nationalNumber.replace(acode, '');

    return {
      country: ctry,
      area: acode,
      phone: ph,
      isValid: true,
    };
  } else if ((phoneNumberParsed.formatInternational(), phoneNumberParsed.isValid())) {
    acode =
      phoneNumberParsed.formatInternational().split(' ').length === 5 // For Mexico and Argentina (1) and (9) extra code.
        ? phoneNumberParsed.formatInternational().split(' ')[1] + phoneNumberParsed.formatInternational().split(' ')[2]
        : phoneNumberParsed.formatInternational().split(' ')[1];
    ph = phoneNumberParsed.nationalNumber.replace(acode, '');
    return {
      country: ctry,
      area: acode,
      phone: ph,
      isValid: phoneNumberParsed.isValid(),
    };
  } else {
    return {
      country: 'Invalid',
      area: 'Invalid',
      phone: 'Invalid',
      isValid: false,
    };
  }
}
