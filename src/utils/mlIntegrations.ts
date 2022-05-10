import { CurrencyExchange } from '../models/CurrencyExchange';
import { Op } from 'sequelize';
import {
  ML_UY_STATE_FILTERS,
  ML_UY_BRANDS,
  ML_UY_VEHICLE_TYPES,
  ML_UY_VEHICLE_CONDITIONS,
} from '../constants/mlConstants';
import { Body, SearchItem } from '../interfaces/Item';
import { ResultSearch } from '../interfaces/MercadoLibre';
import axios, { AxiosResponse } from 'axios';

const { getBrands } = require('../providers/autodata');

export const getMercadolibreResults = async (filters: any) => {
  let vehicles: any[] = [];
  try {
    const parsedFilters = await mlFilterParser(filters);
    // First RQ to ML, Get more than 20 cars
    let MLResponse: AxiosResponse<any>[];
    let results: ResultSearch[] = [];
    let ids: string[] = [];

    let endpoints: string[] = [];
    for (var i = 0; i < 3; i++) {
      endpoints.push(
        `https://api.mercadolibre.com/sites/MLU/search?offset=${
          i * 50
        }&category=MLU1744&seller_type=car_dealer&sort=relevance` + parsedFilters,
      );
    }
    MLResponse = await axios.all(endpoints.map(endpoint => axios.get(endpoint)));
    MLResponse.forEach(response => {
      results = results.concat(response.data.results);
    });
    ids = results.map(x => x.id);
    if (!parsedFilters) {
      // default is random, if filters are present we dont randomize.
      shuffleArray(ids);
    }
    ids = ids.slice(0, 19);
    if (ids.length === 0) {
      return [];
    }
    // Second RQ to ML, Get more information about the randomization of all cars.
    const secondMLResponse = await axios.get('https://api.mercadolibre.com/items?ids=' + ids.toString());
    const items: SearchItem[] = await secondMLResponse.data;
    items.forEach((e: SearchItem) => {
      const item = e.body;
      const vehicle = {
        idMercadoLibre: item.id,
        allImagesMercadoLibre: item.pictures.map(x => x.secure_url),
        accountId: 1,
        year: parseIntIfValueExists(getAttribute(item, 'VEHICLE_YEAR')) ?? 0,
        assemblyYear: parseIntIfValueExists(getAttribute(item, 'VEHICLE_YEAR')) ?? 0,
        saleValuation: item.price,
        mileage: parseIntIfValueExists(getAttribute(item, 'KILOMETERS')?.slice(0, -3)) ?? 0,
        /* inactive: undefined,
                sold: undefined,*/
        type: getAttribute(item, 'VEHICLE_BODY_TYPE') ?? '',
        vehicleConditionId: getAttribute(item, 'ITEM_CONDITION') == 'Usado' ? 'used' : 'new',
        vehicleConditionName: getAttribute(item, 'ITEM_CONDITION') ?? '',
        vehicleBrandName: getAttribute(item, 'BRAND') ?? '',
        /* vehicleFamilyName: "118", */
        vehicleModelName: getAttribute(item, 'MODEL') ?? '',
        vehicleMadeInName: 'ALEMANIA',
        vehicleFuelName: getAttribute(item, 'FUEL_TYPE') ?? '',
        vehicleYear: parseIntIfValueExists(getAttribute(item, 'VEHICLE_YEAR')) ?? 0,
        vehiclePriceAmount: item.price * 0.8, // ToDo: Hay que consultar con Autodata.
        vehiclePriceCurrency: item.currency_id,
        imageCover: {
          name: '',
          url: item.pictures[0].secure_url,
        },
        /* imageExteriorFront: undefined,
                imageExteriorBack: undefined,
                imageExteriorLeft: undefined,
                imageExteriorRight: undefined,
                imageInteriorFront: undefined,
                imageInteriorBack: undefined,
                imageInteriorDashboard: undefined,
                imageInteriorTrunk: undefined,
                imageOther1: undefined,
                imageOther2: undefined,
                imageOther3: undefined, */
        location: {
          zipCode: parseIntIfValueExists(item.location.zip_code)?.toString() ?? '',
          state: item.location.state.name,
          city: item.location.city.name,
          lat: getResult(results, item.id)?.location.latitude?.toString() ?? '',
          lng: getResult(results, item.id)?.location.longitude?.toString() ?? '',
        },
        inventoryTypeId: 30,
        account: {
          id: 1,
          name: 'Consumer',
          legalName: 'Consumer',
          /* companyIDNumber: undefined,
                    address: undefined,
                    city: undefined,
                    state: undefined,
                    bankName: undefined,
                    bankNumber: undefined,
                    bankAccountNumber: undefined,
                    bankAgencyNumber: undefined,
                    bankDigit: undefined,
                    representative1: undefined,
                    representative2: undefined,
                    depositary: undefined,
                    contactEmail: undefined,
                    contactPhone: undefined, */
        },
        inventoryType: {
          code: 'dealer-stock',
          name: 'Concesionaria existente',
        },
        inventoryStatus: {
          code: 'created',
          name: 'Creado',
          searchable: false,
          locked: false,
        },
        linkMercadoLibre: item.permalink,
        sellerMercadoLibre:
          getResult(results, item.id)?.seller_contact.contact ||
          getContactNameFromPermaLink(getResult(results, item.id)?.seller.permalink),
        ml_seller_info_contact:
          getResult(results, item.id)?.seller_contact.contact ||
          getContactNameFromPermaLink(getResult(results, item.id)?.seller.permalink),
        ml_seller_info_id: getResult(results, item.id)?.seller.id,
        ml_seller_info_other_info: getResult(results, item.id)?.seller_contact.other_info,
        ml_seller_info_area_code: getResult(results, item.id)?.seller_contact.area_code,
        ml_seller_info_phone: getResult(results, item.id)?.seller_contact.phone,
        ml_seller_info_area_code2: getResult(results, item.id)?.seller_contact.area_code2,
        ml_seller_info_phone2: getResult(results, item.id)?.seller_contact.phone2,
        ml_seller_info_email: getResult(results, item.id)?.seller_contact.email,
        ml_seller_info_webpage: getResult(results, item.id)?.seller_contact.webpage,
        linkSeller: getResult(results, item.id)?.seller.permalink,
      };
      vehicles.push(vehicle);
    });
  } catch (error) {
    console.log(error);
    return [];
  }
  return vehicles;
};

const mlFilterParser = async (filters: any) => {
  var output = '';
  if (filters) {
    let lastUSD_UYU_ExchRate = await CurrencyExchange.findOne({
      where: {
        [Op.and]: [
          {
            from: 'USD',
          },
          {
            to: 'UYU',
          },
        ],
      },
      order: [['id', 'DESC']],
    });

    output += filters.vehicleName ? '&q=' + filters.vehicleName : '';
    output += filters.type
      ? '&VEHICLE_BODY_TYPE=' +
        ML_UY_VEHICLE_TYPES['values'].filter(
          x => x.name.replace('Hatchback', 'Hatch').replace('á', 'a') === filters.type,
        )[0]?.id
      : '';
    output += filters.city ? '&state=' + ML_UY_STATE_FILTERS['values'].filter(x => x.name === filters.city)[0]?.id : '';

    output += filters.vehicleConditionId
      ? '&ITEM_CONDITION=' +
        ML_UY_VEHICLE_CONDITIONS['values'].filter(
          x => x.name.replace('Nuevo', 'new').replace('Usado', 'used') === filters.vehicleConditionId,
        )[0]?.id
      : '';

    let brands: { id: number; name: string }[] = await getBrands({});
    output += filters.vehicleBrandId
      ? '&BRAND=' +
        ML_UY_BRANDS['values'].filter(
          x => x.name.toUpperCase() === brands.filter(y => y.id === filters.vehicleBrandId)[0]?.name,
        )[0]?.id
      : '';

    output += filters.vehicleYear
      ? '&VEHICLE_YEAR=[' + filters.vehicleYear?.from ??
        new Date().getFullYear() - 10 + '-' + filters.vehicleYear?.to ??
        new Date().getFullYear() + 1 + ']'
      : '';
    output += filters.mileage
      ? '&KILOMETERS=[' +
        (filters.mileage?.from !== 0 ? filters.mileage?.from + 'km' : '0.001km') +
        '-' +
        (filters.mileage?.to === 200000 ? '*)' : filters.mileage?.to + 'km]')
      : '';
    output +=
      filters.saleValuation && lastUSD_UYU_ExchRate
        ? '&price=' +
          (filters.saleValuation?.from !== 0
            ? (filters.saleValuation?.from * lastUSD_UYU_ExchRate.value).toFixed(1).toString()
            : '*') +
          '-' +
          (filters.saleValuation?.to === 250000
            ? '*'
            : (filters.saleValuation?.to * lastUSD_UYU_ExchRate.value).toFixed(1).toString())
        : '';
  }
  return output;
};

function parseIntIfValueExists(value: any): number | undefined {
  if (value && value !== '') {
    return parseInt(value);
  } else {
    return undefined;
  }
}

function getResult(results: ResultSearch[], id: string): ResultSearch | undefined {
  return results.find(result => result.id === id);
}

function getAttribute(body: Body, id: string): string | undefined {
  return body.attributes.find(att => att.id == id)?.value_name;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function getContactNameFromPermaLink(permalink: string | undefined) {
  if (!permalink) {
    return 'Unamed Dealer';
  }

  const splittedPermalink = permalink.split('/');
  let sellerName = splittedPermalink.slice(-1)[0];
  if (sellerName) {
    return sellerName
      .replace(/[^A-Z0-9]+/gi, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else {
    return 'Unamed Dealer';
  }
}
