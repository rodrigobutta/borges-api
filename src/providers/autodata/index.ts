import { isEmpty } from 'lodash';
import { URLSearchParams } from 'url';
import { CURRENCIES } from '../../constants';
import settings from '../../settings';

const axios = require('axios');
const { autoData } = settings;
const { getValue, setValue } = require('../../utils/variables');

// const {
//   CURRENCIES,
// } = require("./constants");

const AUTODATA_VARIABLE_NAME = 'autodataSession';
const FIXED_CLASIFICATION = 'AB';

const regexRemoveTags = /(<([^>]+)>)/gi;

const prettifyBrand = (brandName: string) => brandName.replace(regexRemoveTags, '').trim();

const getSession: any = async (refresh = false) => {
  try {
    if (refresh) {
      const token = `${autoData.USER}:${autoData.PASSWORD}:domain|autodata`;
      const buff = Buffer.from(token);
      const base64token = buff.toString('base64');

      const response = await axios.post(
        `${autoData.ENDPOINT}/security/api/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${base64token}`,
          },
        },
      );

      await setValue(AUTODATA_VARIABLE_NAME, response.data);

      return response.data;
    } else {
      const response = await getValue(AUTODATA_VARIABLE_NAME);

      if (!response) {
        return getSession(true);
      }

      return response;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

interface doGetProps {
  endpoint: string;
  data: string;
  refreshSession: any;
}

const doGet: any = async (props: doGetProps) => {
  const { endpoint, data, refreshSession = false } = props;

  try {
    const parameters = data ? new URLSearchParams(data).toString() : '';
    const splitter = data ? '?' : '';
    const url = `${autoData.ENDPOINT}${endpoint}${splitter}${parameters}`;

    const autodataSession = await getSession(refreshSession);
    const buff = Buffer.from(autodataSession.sessionToken);
    const base64session = buff.toString('base64');

    return await axios.get(url, {
      headers: {
        Session: base64session,
      },
    });
  } catch (error: any) {
    if (error.response && error.response.status === 401 && refreshSession === false) {
      console.log('autoData doGet refreshing token');
      return doGet({
        endpoint,
        data,
        refreshSession: true,
      });
    }

    throw error;
  }
};

const getBrands = async ({ newCar = false }) => {
  try {
    const response = await doGet({
      endpoint: `/clasificaciones/${FIXED_CLASIFICATION}/marcas`,
      data: {
        cerokm: newCar,
      },
    });

    return response.data.map((d: any) => {
      const { codigo, nombre } = d;
      return {
        id: codigo,
        name: prettifyBrand(nombre),
      };
    });
  } catch (error) {
    throw error;
  }
};

const getYears = async (props: any) => {
  const { brandId } = props;
  try {
    const response = await doGet({
      endpoint: `/clasificaciones/${FIXED_CLASIFICATION}/marcas/${brandId}/anios`,
    });

    return response.data.map((d: any) => {
      const { anio } = d;
      return anio;
    });
  } catch (error) {
    throw error;
  }
};

const getFamilies = async ({
  brandId,
  year = null, // not used if newCar is true
  newCar = true,
}: {
  brandId: string;
  year: string | null;
  newCar: boolean;
}) => {
  try {
    const endpoint = newCar
      ? `/clasificaciones/${FIXED_CLASIFICATION}/marcas/${brandId}/familias`
      : `/clasificaciones/${FIXED_CLASIFICATION}/marcas/${brandId}/anios/${year}/familias`;
    console.log('Esta eligiendo bien el endpoint ', endpoint, newCar, year, brandId);

    const response = await doGet({ endpoint });

    return response.data.map((d: any) => {
      const { codigo, nombre } = d;
      return {
        id: codigo,
        name: nombre,
      };
    });
  } catch (error) {
    throw error;
  }
};

const getModels = async (props: any) => {
  const {
    brandId,
    familyId,
    year = null, // not used if newCar is true
    newCar = true,
  } = props;
  try {
    const endpoint = newCar
      ? `/clasificaciones/${FIXED_CLASIFICATION}/marcas/${brandId}/familias/${familyId}/modelos`
      : `/clasificaciones/${FIXED_CLASIFICATION}/marcas/${brandId}/anios/${year}/familias/${familyId}/modelos`;

    const response = await doGet({ endpoint });

    return response.data.map((d: any) => {
      const { codigo, nombre } = d;
      return {
        id: codigo,
        name: nombre,
      };
    });
  } catch (error) {
    throw error;
  }
};

export const getModel = async (props: any) => {
  const { modelId } = props;
  try {
    const endpoint = `/padron/${modelId}`;
    //console.log("Endpoint autodata.. ", modelId, endpoint);
    const response = await doGet({ endpoint });
    const data = response.data[0];
    //console.log("Respuesta autodata.. ", response, data, CURRENCIES);

    if (isEmpty(data)) {
      return {};
    }

    return {
      clasification: {
        id: data.categoria.codigo,
        name: data.categoria.nombre,
      },
      brand: {
        id: data.marca.codigo,
        name: prettifyBrand(data.marca.nombre),
      },
      model: {
        id: data.modelo.codigo,
        name: data.modelo.nombre,
      },
      family: {
        id: data.familia.codigo,
        name: data.familia.nombre,
      },
      madeIn: {
        id: data.origen.codigo,
        name: data.origen.nombre,
      },
      fuel: {
        id: data.combustion.codigo,
        name: data.combustion.nombre,
      },
      year: data.anio,
      newCar: data.esCeroKm,
      priceAmount: Math.round(parseInt(data.valor)),
      priceCurrency: CURRENCIES ? CURRENCIES['USD'] : 'R$',
      parameters:
        data.adicionales &&
        data.adicionales.map((ad: any) => {
          const { clave, descripcion, valor } = ad;
          return {
            id: clave,
            value: valor,
            description: descripcion,
          };
        }),
      // addedType: data.ingreso,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getBrands,
  getYears,
  getFamilies,
  getModels,
  getModel,
};
