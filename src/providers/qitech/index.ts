// const crypto = require("crypto");
import FormData from 'form-data';
import crypto from 'crypto';
import { QiTechResponse } from '../../dto/QiTech/QiTechResponse';
import { Offer } from '../../models/Offer';
import { OfferLogRequest } from '../../models/OfferLogRequest';
import settings from '../../settings';
import jwt, { Algorithm, JwtPayload, Secret } from 'jsonwebtoken';
import utf8 from 'utf8';
import { get } from 'lodash';
import { LoanApplicationProviderLog } from '../../models/LoanApplicationProviderLog';
import QitException from '../../exceptions/QitException';
import fetch from 'node-fetch';
import InternalError from '../../exceptions/InternalError';
// import { LoanApplication } from "../../models/LoanApplication";

const { qiTech: config } = settings;
const axios = require('axios');

export const qitech = {
  encodeMessage: (endpoint: string, method: string, payload: any, contentType: string) => {
    console.log('PRIVATE KEY QiT: ', config.CLIENT_PRIVATE_KEY, config.CLIENT_PRIVATE_KEY?.replace('\\n', '\n'));
    const encodedBodyToken = jwt.sign(payload, <Secret>config.CLIENT_PRIVATE_KEY?.replace(/\\n/gm, '\n'), {
      algorithm: <Algorithm>(config.ALGORITHM ?? ''),
    });

    const requestBody = {
      encoded_body: encodedBodyToken,
    };

    const md5Body = crypto.createHash('md5').update(utf8.encode(encodedBodyToken)).digest('hex');
    const date = new Date().toUTCString();
    const stringToSign = method + '\n' + md5Body + '\n' + contentType + '\n' + date + '\n' + endpoint;
    const headers = {
      alg: config.ALGORITHM ?? '',
      typ: 'JWT',
    };
    const claims = {
      sub: config.API_KEY,
      signature: stringToSign,
    };

    const encodedHeaderToken = jwt.sign(claims, <Secret>config.CLIENT_PRIVATE_KEY?.replace(/\\n/gm, '\n'), {
      algorithm: <Algorithm>config.ALGORITHM,
      header: headers,
    });

    const authorization = `QIT ${config.API_KEY}:${encodedHeaderToken}`;
    const requestHeader = {
      'AUTHORIZATION': authorization,
      'API-CLIENT-KEY': config.API_KEY,
    };

    return [requestBody, requestHeader];
  },

  decodeMessage: (responseBody: any): JwtPayload => {
    return <JwtPayload>jwt.verify(
      get(responseBody, 'encoded_body'),
      <Secret>config.PUBLIC_KEY?.replace(/\\n/gm, '\n'),
      {
        algorithms: [<Algorithm>config.ALGORITHM],
      },
    );
  },
};

const mapResponseDataToOffer = (data: QiTechResponse, consumerLoanRequestId: number) => {
  return {
    consumerLoanRequestId: consumerLoanRequestId,
    term: data.number_of_installments,
    calcs: data,
    installmentAmount: data.installments[0].total_amount,
  };
};

const responseHasKnowError = (responseBody: any) => {
  if (!responseBody) {
    return false;
  }

  const code = responseBody.code;
  switch (code) {
    case 'GDF000014':
      return true;
    default:
      return false;
  }
};

const query = async (params: any) => {
  const { endpoint, payload, consumerLoanRequestId } = params;

  try {
    await OfferLogRequest.create({
      raw: JSON.stringify(payload),
      quoteId: consumerLoanRequestId,
    });

    const [requestBody, requestHeader] = qitech.encodeMessage(endpoint, 'POST', payload, 'application/json');

    const response = await axios.post(`${config.ENDPOINT_URL}${endpoint}`, requestBody, {
      headers: requestHeader,
    });

    const decodeMessage = qitech.decodeMessage(response.data);

    if (decodeMessage?.data && decodeMessage.data.length > 0) {
      const offers: Offer[] = decodeMessage.data.map((x: any) => mapResponseDataToOffer(x.data, consumerLoanRequestId));

      await Offer.bulkCreate(offers);

      return { offers, response: decodeMessage };
    }

    return { offers: [], response: decodeMessage };
  } catch (e: any) {
    try {
      if (responseHasKnowError(e.response.data)) {
        console.log(e.response.data.title, e.response.data.translation);
        throw new QitException(e.response.data.translation);
      }
      throw qitech.decodeMessage(e.response?.data);
    } catch (e: any) {
      throw e;
    }
  }
};

const newDebt = async (loanApplicationId: number | string, payload: any) => {
  const endpoint = '/debt';
  const url = `${config.ENDPOINT_URL}${endpoint}`;
  const method = 'POST';

  const providerLog = await LoanApplicationProviderLog.create({
    loanApplicationId,
    type: 'new_debt',
    url,
    method,
    requestData: payload,
  });

  try {
    const [requestBody, requestHeader] = qitech.encodeMessage(endpoint, method, payload, 'application/json');

    const response = await axios.post(url, requestBody, {
      headers: requestHeader,
    });

    const decodedResponse = qitech.decodeMessage(response.data);

    await providerLog.update({
      responseStatus: response.status,
      responseData: decodedResponse,
    });

    return {
      qitechApplicationId: decodedResponse.key,
      statusCode: decodedResponse.status,
    };
  } catch (error: any) {
    console.log(error);

    await providerLog.update({
      responseStatus: error.response.status,
    });

    try {
      const decodedErrorResponse = qitech.decodeMessage(error.response.data);

      await providerLog.update({
        responseData: decodedErrorResponse,
      });

      throw new InternalError(error, decodedErrorResponse);
    } catch (e: any) {
      throw new InternalError(e);
    }
  }
};

const upload = async (file2Qit: any, loanApplicationId: string) => {
  const { url, name, md5hash } = file2Qit;

  const endpoint = '/upload';
  const providerUrl = `${config.ENDPOINT_URL}${endpoint}`;

  let resFile;

  // TODO REB why this method inside, rewrite extend
  const encodeMessage = (endpoint: string, method: string, contentType: string) => {
    const md5Body = md5hash;
    const date = new Date().toUTCString();
    const stringToSign = method + '\n' + md5Body + '\n' + contentType + '\n' + date + '\n' + endpoint;

    const headerJwt = {
      alg: config.ALGORITHM ?? '',
      typ: 'JWT',
    };
    const bodyJwt = {
      sub: config.API_KEY,
      signature: stringToSign,
    };

    // const encodedHeaderToken = jwt.sign(
    //   bodyJwt,
    //   <Secret>config.CLIENT_PRIVATE_KEY,
    //   {
    //     algorithm: <Algorithm>(config.ALGORITHM ?? ""),
    //     header: { alg: String(config.ALGORITHM), typ: "JWT" },
    //   }
    // );

    const encodedHeaderToken = jwt.sign(bodyJwt, <Secret>config.CLIENT_PRIVATE_KEY?.replace('\\n', '\n'), {
      algorithm: <Algorithm>config.ALGORITHM,
      header: headerJwt,
    });

    const authorization = `QIT ${config.API_KEY}:${encodedHeaderToken}`;

    const requestHeader = {
      'Authorization': authorization,
      'API-CLIENT-KEY': config.API_KEY,
    };

    return requestHeader;
  };

  const requestHeader = encodeMessage(endpoint, 'POST', 'application/json');

  const formData = new FormData();

  try {
    resFile = await fetch(url);
  } catch (error) {
    throw new InternalError(error, `Error fetching file ${name}`);
  }
  const arrayBuffer = await resFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  formData.append('file', buffer, name);

  const providerLog = await LoanApplicationProviderLog.create({
    loanApplicationId,
    type: 'upload_file',
    url: providerUrl,
    method: 'POST',
    requestData: {
      headers: { ...requestHeader, ...formData.getHeaders() },
      file: { ...file2Qit },
    },
  });

  try {
    const response = await axios.post(providerUrl, formData, {
      headers: {
        ...requestHeader,
        ...formData.getHeaders(),
      },
    });

    const decodedResponse = qitech.decodeMessage(response.data);
    const documentKey = decodedResponse.document_key as string;

    await providerLog.update({
      responseStatus: response.status,
      responseData: decodedResponse,
    });

    return { document_key: documentKey };
  } catch (error: any) {
    await providerLog.update({
      responseStatus: error.response.status,
    });

    try {
      const decodedErrorResponse = qitech.decodeMessage(error.response.data);

      await providerLog.update({
        responseData: decodedErrorResponse,
      });

      throw new InternalError(error, decodedErrorResponse);
    } catch (e: any) {
      throw new InternalError(e);
    }
  }
};

export { query, newDebt, upload };
