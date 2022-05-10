import { Inventory } from '../models/Inventory';
import { isEmpty } from 'lodash';
import { VEHICLE_GENERAL_CONDITIONS } from '../constants';
import { getModelProvider } from '../lib/inventory';

const distancePerYearStandard = 20000; // in kilometers
const substractedPercentagePerYear = 10; // in %
const markupPercentage = 5; // in %
const maxAmountOfYearsBeforeInvDelcaredYear = 10;
const percentageChangeBasedOnGeneralCondition = [
  { id: VEHICLE_GENERAL_CONDITIONS['poor'], value: -20 },
  { id: VEHICLE_GENERAL_CONDITIONS['fair'], value: -8 },
  { id: VEHICLE_GENERAL_CONDITIONS['good'], value: 0 },
  { id: VEHICLE_GENERAL_CONDITIONS['excellent'], value: 10 },
];

export const borgesPricer = async ({ inventory, showLogs = false }: { inventory: Inventory; showLogs?: boolean }) => {
  // Only possible for autodata cars for now.
  if (!inventory.vehicleModelId || inventory.vehicleConditionId !== 'used') {
    return inventory.vehiclePriceAmount; // If the car is new, borgesPrice = autodataValue
  }

  const currentYear = new Date().getFullYear(); // 2022
  const vehicleAge = currentYear - (inventory.vehicleYear || inventory.assemblyYear); // 2022 - 2015 = 7
  const maxDistance = vehicleAge * distancePerYearStandard; // 7 * 20000 = 140000

  // TODO should be kilometers or more general, distance.
  let borgesPrice;
  if (!inventory.mileage) {
    borgesPrice = inventory.vehiclePriceAmount;

    showLogs &&
      console.log(
        ' ---------------------------------------',
        '\n',
        'No vehicle distance provided.',
        '\n',
        'Borges price after distance correction: ',
        borgesPrice,
      );
  } else if (inventory.mileage > maxDistance) {
    // 185000 > 140000
    const differenceInDistance = inventory.mileage - maxDistance; // 185000 - 140000 = 25000
    const differenceInYears = differenceInDistance / distancePerYearStandard; // 25000 / 20000 = 1,25
    // TODO dont use round. Split the whole part of the number to reach autodata and the rest for linear interpolation.
    const differenceInYearsWhole = Math.floor(differenceInYears);

    // Taking into account the differenceInYears value, we search for the base price of the same model
    // but different year car. It may or may not exist.

    const vehicleApparentYear = inventory.vehicleYear - differenceInYearsWhole;
    let yearFetched = vehicleApparentYear;
    // const vehicleModelWithoutYear = inventory.vehicleModelId.slice(0, -4);
    // let modelToFetch: string = '';

    // (0 && 0 ) = 0 > Resp has data and yearFetched = vehicleYear, stop looping
    // (0 && 1 ) = 0 > Response has data, stop looping
    // (1 && 0 ) = 0 > yearFetched = vehicleYear stop looping
    // (1 && 1 ) = 1 > Response empty and yearFetched less than vehicleYear, continue looping
    let response: any;

    // To avoid lots of requests to Autodata we cap the max year fetched to 15 years behind.
    inventory.vehicleYear - yearFetched > maxAmountOfYearsBeforeInvDelcaredYear &&
      (yearFetched = inventory.vehicleYear - maxAmountOfYearsBeforeInvDelcaredYear);

    while (isEmpty(response) && yearFetched <= inventory.vehicleYear) {
      response = await getModelProvider({
        pBrandCode: inventory.vehicleBrandId,
        pFuelCode: inventory.vehicleFuelId,
        pYearCode: String(yearFetched),
        pModelCode: inventory.vehicleModelId,
      });
      yearFetched += 1;
    }
    yearFetched -= 1; // Before exiting the while loop we add one. Substracted here.

    // if currentYear - yearFetched < Condition || coulnd't find older autodata vehicles we
    // keep autodata price.
    borgesPrice = isEmpty(response) ? inventory.vehiclePriceAmount : response.priceAmount;

    let correctionFactorPerYear;
    let substractedValue;
    if (yearFetched > vehicleApparentYear) {
      //need to correct the difference by substracting X% per year
      correctionFactorPerYear = Math.pow(1 - substractedPercentagePerYear / 100, yearFetched - vehicleApparentYear);
      substractedValue = borgesPrice - borgesPrice * correctionFactorPerYear;
      borgesPrice = borgesPrice * correctionFactorPerYear;
    }
    borgesPrice = parseInt(borgesPrice);

    showLogs &&
      console.log(
        ' ---------------------------------------',
        '\n',
        'Model and year: ',
        inventory.vehicleModelName,
        ' ',
        inventory.vehicleYear,
        '\n',
        'Max distance for vehicle age: ',
        maxDistance,
        '\n',
        'Vehicle real distance: ',
        inventory.mileage,
        '\n',
        'Difference between max and real distance: ',
        differenceInDistance,
        '\n',
        'Difference in years based on distance excess: ',
        differenceInYears,
        '\n',
        'Rounded (floor) years value: ',
        differenceInYearsWhole,
        '\n',
        'Current year: ',
        currentYear,
        '\n',
        'Vehicle declared year: ',
        inventory.vehicleYear,
        '\n',
        'Vehicle apparent year: ',
        vehicleApparentYear,
        '\n',
        'Vehicle age: ',
        vehicleAge,
        '\n',
        'Vehicle apparent age: ',
        vehicleAge + differenceInYearsWhole,
        '\n',
        'Oldest autodata result year for corresponding model: ',
        yearFetched,
        '\n',
        'Difference between oldest autodata result year and vehicle apparent year: ',
        yearFetched - vehicleApparentYear,
        '\n',
        'Correction factor per year excess based on oldest autodata difference',
        substractedPercentagePerYear,
        '%\n',
        'If vehicle apparent year is oldest than autodata result year, correction factor (1 - X/100)^years): ',
        correctionFactorPerYear ? correctionFactorPerYear * 100 : 0,
        '%\n',
        'If vehicle apparent year is oldest than autodata result year, substracted amount: ',
        substractedValue ? substractedValue : 0,
        '\n',
        'Autodata initial price: ',
        inventory.vehiclePriceAmount,
        '\n',
        'Autodata oldest vehicle price (if exists): ',
        response?.priceAmount ?? 0,
        '\n',
        'Borges price after distance correction: ',
        borgesPrice,
        '\n',
      );
  } else {
    borgesPrice = inventory.vehiclePriceAmount;
    showLogs &&
      console.log(
        ' ---------------------------------------',
        '\n',
        'Model and year: ',
        inventory.vehicleModelName,
        ' ',
        inventory.vehicleYear,
        '\n',
        'Max distance for vehicle age: ',
        maxDistance,
        '\n',
        'Vehicle real distance: ',
        inventory.mileage,
        '\n',
        'No need to correct price due to distance excess.',
        '\n',
        'Autodata initial price: ',
        inventory.vehiclePriceAmount,
        '\n',
        'Borges price after distance correction: ',
        borgesPrice,
      );
  }

  if (inventory.vehicleGeneralConditionId) {
    let vehicleGeneralConditionFactor;
    let vehicleGeneralConditionValueChange;
    vehicleGeneralConditionFactor =
      percentageChangeBasedOnGeneralCondition.filter(x => x.id === inventory.vehicleGeneralConditionId)[0].value / 100;
    vehicleGeneralConditionValueChange = borgesPrice * vehicleGeneralConditionFactor;
    borgesPrice = borgesPrice + vehicleGeneralConditionValueChange;

    showLogs &&
      console.log(
        ' ---------------------------------------',
        '\n',
        'General condition correction percentage: ',
        vehicleGeneralConditionFactor * 100,
        '%\n',
        'General condition correction value: ',
        vehicleGeneralConditionValueChange,
        '\n',
        'Borges Price after general condition correction: ',
        borgesPrice,
        '\n',
      );
  } else {
    showLogs &&
      console.log(
        ' ---------------------------------------',
        '\n',
        'No vehicle condition was provided, assuming -good- \n',
        'Borges Price after general condition correction: ',
        borgesPrice,
        '\n',
      );
  }

  // It's assumed that base prices are a little bit low.
  // Markup strategy corrects this difference after all
  // the analysis.
  let markupValue = borgesPrice * (markupPercentage / 100);
  borgesPrice = borgesPrice * (1 + markupPercentage / 100);
  showLogs &&
    console.log(
      ' ---------------------------------------',
      '\n',
      'Markup correction percentage: ',
      markupPercentage,
      '%\n',
      'Markup value: ',
      markupValue,
      '\n',
      'Borges Price after markup correction: ',
      borgesPrice,
      '\n',
      '---------------------------------------',
      '\n',
    );

  return borgesPrice;
};
