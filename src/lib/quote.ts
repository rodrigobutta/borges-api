import {
  CHANNELS,
  QUOTE_STATUS,
  CONSUMER_ACCOUNT_ID,
  CONSUMER_API_USER_ID,
  DEFAULT_DEALER_COMMISSION_TABLE_ID,
} from '../constants';
import CustomerNotFoundException from '../exceptions/CustomerNotFoundException';
import InventoryNotFoundException from '../exceptions/InventoryNotFoundException';
import LeadNotFoundException from '../exceptions/LeadNotFoundException';
import QuoteAnalysisException from '../exceptions/QuoteAnalysisException';
import QuoteRejectException from '../exceptions/QuoteRejectException';
import QuoteWithErrorException from '../exceptions/QuoteWithErrorException';
import { Customer } from '../models/Customer';
import { Inventory } from '../models/Inventory';
import { Account } from '../models/Account';
import { Lead } from '../models/Lead';
import { Offer } from '../models/Offer';
import { Quote } from '../models/Quote';
import { Profile } from '../models/Profile';
import { fetchLoanAnalysis } from '../providers/besmart';
import { Sequelize, Op, WhereOptions } from 'sequelize';
import QuoteUpdateException from '../exceptions/QuoteUpdateException';
import { clearCustomerAnalysisCache, getCustomerByCitizenNumber, getCustomerById } from './customer';
import { QuoteActivity } from '../models/QuoteActivity';
import { valueExistsInArray } from '../utils/common';
import { getAuthUserId } from '../utils/auth';
import { InventoryType } from '../models/InventoryType';
import { QuoteStatus } from '../models/QuoteStatus';
import { QuoteAnalysisLog } from '../models/QuoteAnalysisLog';
import { LoanApplication } from '../models/LoanApplication';
import QuoteNotFoundException from '../exceptions/QuoteNotFoundException';
import { query } from '../providers/qitech/index';
import { getGravamenAmount } from './gravamen';
import nextBizDayByCountry from './nextBizDayByCountry';
import { DocumentSignature } from '../models/DocumentSignature';
import DocumentSignatureNotFoundException from '../exceptions/DocumentSignatureNotFoundException';
import { BASE_RATE, BESMART_DECISIONS } from '../providers/besmart/constants';
import { InventorySnapshot } from '../models/InventorySnapshot';
import { createInventorySnapshot, refreshInventorySnapshot } from '../utils/inventoryUtils';
import { QuoteStatusReason } from '../models/QuoteStatusReason';
import { isEmpty } from 'lodash';
import { DealerCommission } from '../models/DealerCommission';

const QUOTE_HIGHEST_INTEREST = 3;
const SCR_DOCUMENT_ID = 1;

export interface ILoan {
  key?: number;
  term: number;
  percentage?: any;
  totalAmount?: any;
  installmentAmount: any;
  calcs?: Calculator;
}

export interface Payment {
  n: number;
  date: Date;
  remainingPrincipal: number;
  amortization: number;
  interest: number;
  iva: number;
  administrativeFee: number;
  insuranceFee?: number;
  insurance?: number;
  ivaInsurance?: number;
  periodPayment: number;
}

export interface Calculator {
  productTerm: number;
  capital: number;
  productEffectiveAnualRate: number;
  productEffectivePeriodRate: number;
  installmentAmount: number;
  tna: number;
  tea: number;
  insuranceRate: number;
  periodPayment: number;
  feeAdministrative: number;
  productAmortizationSchedule: Payment[];
  cft: number;
  totalInterest: number;
}

export const getFees = async ({
  gravamenStateCode,
  commissionId,
  borgesScore,
  carAge,
}: {
  gravamenStateCode: string;
  commissionId: number;
  borgesScore: string;
  carAge: number;
}) => {
  //Implement logic to get fees. There are constants by now.

  // const usdExchange = await convert(CURRENCIES.USD, CURRENCIES.UYU, 1);
  // const uiExchange = await convert(CURRENCIES.UYI, CURRENCIES.UYU, 1);

  const gravamenAmount = await getGravamenAmount(gravamenStateCode);
  const dealerCommission = await getDealerCommission(commissionId, borgesScore, carAge);

  // return {
  //   UI_Exchange_Rate: 1,
  //   US_Exchange_Rate: 1,
  //   Expenses: EXPENSES, // ToDo: Expresado en dólares, el dealer elige al cotizar si se suma al capital, o va por fuera (tiene que ser un dato modificable).
  //   Insurance: INSURANCE_RATE,
  //   Granting_Fee: FEE_GRANTING,
  //   Administrative_Fees: FEE_ADMINISTRATIVE,
  //   Base_Rate: BASE_RATE,
  //   Base_Rate_UI: 29.0,
  //   Base_Rate_US: 8.0,
  //   Gravamen: gravamenAmount,
  //   Dealer_Comission: dealerCommission || 0.0,
  // };

  return {
    Gravamen: gravamenAmount,
    IOF: 3.0, // Fixed harcoded
    TAC: 1200, // Fixed harcoded
    Dealer_Comission: dealerCommission,
    Base_Rate: BASE_RATE, // Fixed harcoded
  };
};

export const calculateOffers = async ({
  loanMaxAmount,
  loans,
  approvedAmount,
  maxInstallmentAmount,
  quoteId,
  fees,
  includeExpenses = false,
  gravamenAmount,
}: {
  loanMaxAmount: number | null;
  loans: ILoan[];
  approvedAmount: number | null;
  maxInstallmentAmount: number;
  quoteId: number;
  fees: any;
  includeExpenses: boolean;
  gravamenAmount: number | null;
}): Promise<ILoan[]> => {
  fees ? includeExpenses : '';

  await Offer.destroy({ where: { consumerLoanRequestId: quoteId } });
  const date = new Date();
  date.setDate(date.getDate() + 7);

  if (loanMaxAmount === null || approvedAmount === null) {
    return [];
  }

  if (approvedAmount > loanMaxAmount) {
    return [];
  }

  const qitechRequest = {
    complex_operation: true,
    operation_batch: loans.map((loan: ILoan) => ({
      borrower: {
        person_type: 'natural',
      },
      financial: {
        disbursed_amount: Math.min(Number(approvedAmount), Number(loanMaxAmount)),
        interest_type: 'pre_price_days',
        credit_operation_type: 'ccb',
        annual_interest_rate: loan.percentage,
        disbursement_date: nextBizDayByCountry(date, 'BR'),
        interest_grace_period: 0,
        principal_grace_period: 0,
        number_of_installments: parseInt(String(loan.term)),
        rebates: [
          {
            fee_type: 'tac',
            amount_type: 'absolute',
            amount: 1200,
          },
          {
            fee_type: 'registry_fee',
            amount_type: 'absolute',
            amount: gravamenAmount,
          },
        ],
        fine_configuration: {
          contract_fine_rate: 0.02,
          interest_base: 'calendar_days',
          monthly_rate: 0.01,
        },
      },
    })),
  };

  const offersResponse = await query({
    endpoint: '/debt_simulation',
    payload: qitechRequest,
    consumerLoanRequestId: quoteId,
    maxInstallmentAmount,
  });

  return offersResponse.offers.map(offer => {
    return {
      term: offer.term,
      installmentAmount: offer.calcs.installmentAmount,
      calcs: offer.calcs,
      quoteId: offer.consumerLoanRequestId,
      key: offer.id,
    };
  });
};

export const getQuote: any = async (quoteId: number) => {
  const quote = await Quote.findByPk(quoteId, {
    include: [
      {
        model: Lead,
        include: [
          {
            model: Customer,
          },
        ],
      },
      {
        model: Inventory,
        include: [
          {
            model: InventoryType,
          },
        ],
      },
      {
        model: QuoteStatus,
      },
      {
        model: QuoteStatusReason,
      },
      {
        model: QuoteAnalysisLog,
      },
      {
        model: Profile,
        include: [
          {
            model: Account,
          },
        ],
      },
      {
        model: LoanApplication,
        attributes: ['id', 'status'],
      },
      {
        model: Customer,
      },
      {
        model: Profile,
        include: [{ model: Account }],
      },
    ],
    raw: true,
    nest: true,
  });
  if (!quote) {
    throw new QuoteNotFoundException();
  }

  // TODO can we reduce the amount of info of the offers? All the data is really being used in the responses?
  const offers = await Offer.findAll({
    where: {
      consumerLoanRequestId: quote.id,
    },
    raw: true,
    nest: true,
  });

  const extendedQuote = {
    ...quote,
    customerId: quote.lead.customerId, // TODO maybe add customerId to te Quote entity (?)
    loanRequestId: quote.id,
    quoteId: quote.id,
    offers,
  };

  return extendedQuote;
};

export const doQuote = async ({
  user,
  inventoryId,
  accountId,
  pJobType,
  pDeclaredIncome,
  leadId = null,
  channel = CHANNELS['consumer-web'],
  pGravamenStateCode,
  interest = null,
  cosignerCitizenNumber = null,
  cosignerJobType = null,
  cosignerDeclaredIncome = null,
  commissionId = DEFAULT_DEALER_COMMISSION_TABLE_ID,
  includeExpenses = false,
  pAmount = null,
  isDealer = false,
}: {
  user: Profile;
  inventoryId: number;
  leadId?: number | null;
  channel?: string | null;
  pGravamenStateCode?: string;
  interest?: number | null;
  accountId?: number | null;
  pJobType?: number | null;
  pDeclaredIncome?: number | null;
  cosignerCitizenNumber?: number | null;
  cosignerJobType?: number | null;
  cosignerDeclaredIncome?: number | null;
  commissionId?: number;
  includeExpenses?: boolean;
  pAmount?: number | null;
  isDealer?: boolean;
}) => {
  const userId = getAuthUserId(user ?? null);

  const { lead, inventory, inventorySnapshot, customer, income, jobType, customerId, customerChanged } =
    await checkRequiredParameters({
      isDealer,
      pDeclaredIncome,
      pJobType,
      leadId,
      accountId,
      user,
      inventoryId: String(inventoryId),
    });

  const gravamenStateCode = pGravamenStateCode ?? lead.account.state;

  const year = new Date().getFullYear();
  const assembly = inventory.assemblyYear || year;
  const carAge: number = year - assembly;
  // TODO Take a look to the pricing logic. vehiclePriceAmount is autodata value (in case of ML is 80% of sale price).
  // TODO saleValuation is the sale price (what the customer has to pay for the car)
  const priceToCalc = inventory.vehiclePriceAmount || inventory.saleValuation * 0.8; // May Add inventory.borgesPrice if required

  const scrSignature = await DocumentSignature.findOne({
    where: {
      customerId: lead.customerId,
      documentId: SCR_DOCUMENT_ID,
    },
    attributes: ['signedFile'],
  });
  if (!scrSignature) {
    throw new DocumentSignatureNotFoundException();
  }

  const loanAnalysisAuthenticity = {
    ip_address: '1.1.1.1',
    session_id: 'session',
    signable: scrSignature.signedFile,
  };

  let cosignerCustomer: Customer | null = null;
  if (cosignerCitizenNumber) {
    await Customer.upsert({
      citizenNumber: cosignerCitizenNumber,
      jobType: cosignerJobType,
      declaredIncome: cosignerDeclaredIncome,
    });

    cosignerCustomer = await getCustomerByCitizenNumber(cosignerCitizenNumber);
    if (!cosignerCustomer) {
      throw new CustomerNotFoundException('Cosigner customer nor found');
    }
  }

  // try {
  let debug = {};

  // const dealerCommission = 0;
  const reference = 1; // uuidv4();

  // const priceToCalcInUYU = await convert(
  //   CURRENCIES["USD"],
  //   CURRENCIES["UYU"],
  //   priceToCalc
  // );
  // if (!priceToCalcInUYU) {
  //   throw new CurrencyException(
  //     "Couldn't convert vehicle price from USD to UYU"
  //   );
  // }

  const feesData = await getFees({
    borgesScore: customer.analysis.score,
    carAge,
    commissionId,
    gravamenStateCode,
  });

  const cosignerDataForQuote = cosignerCustomer
    ? {
        cosignerCustomerId: cosignerCustomer.id,
        cosignerJobTypeId: cosignerCustomer.jobType,
        cosignerDeclaredIncome: cosignerCustomer.declaredIncome,
        cosignerAnalysisScore: cosignerCustomer.analysis.score,
        cosignerAnalysisCode: cosignerCustomer.analysis.code,
        cosignerAnalysisReason: cosignerCustomer.analysis.reason,
        cosignerAnalysisDecision: cosignerCustomer.analysis.decision,
      }
    : {};

  const newQuoteBody = {
    reference,
    leadId: lead.id,
    inventoryId: inventorySnapshot ? inventorySnapshot.inventoryId : inventory.id,
    inventorySnapshotId: inventorySnapshot?.id,
    inventorySaleValuation: priceToCalc,
    inventoryNew: inventory.new,
    inventoryAge: carAge,
    userId,
    declaredIncome: income,
    dealerCommissionId: commissionId,
    dealerCommissionPercentage: feesData.Dealer_Comission,
    channel,
    jobTypeId: jobType,
    customerAnalysisScore: customer.analysis.score,
    customerAnalysisCode: customer.analysis.code,
    customerAnalysisReason: customer.analysis.reason,
    customerAnalysisDecision: customer.analysis.decision,
    customerAnalysisLogId: customer.analysis.customerAnalysisLogId,
    loanIncludeExpenses: includeExpenses,
    interest,
    ...cosignerDataForQuote,
    gravamenStateCode,
    gravamenAmount: feesData.Gravamen,
  };

  const quote = await createOrUpdateQuote({
    newQuoteBody,
    leadId: lead.id,
    inventoryId: String(inventoryId),
    userId,
    accountId,
  });
  if (!quote) {
    throw new QuoteUpdateException("Couldn't create or update Quote");
  }

  const applicationData = {
    quoteId: quote.id,
    amount: priceToCalc,
    age: carAge,
    channel: channel,
    new: inventory.new,
  };

  let cosignerData = null;
  let loanAnalysisCosignerAuthenticity = null;
  if (cosignerCustomer) {
    const cosignerScrSignature = await DocumentSignature.findOne({
      where: {
        customerId: cosignerCustomer.id,
        documentId: SCR_DOCUMENT_ID,
      },
      attributes: ['signedFile'],
    });
    if (!cosignerScrSignature) {
      throw new DocumentSignatureNotFoundException('Cosigner SCR signature not found');
    }

    cosignerData = {
      citizenNumber: cosignerCustomer.citizenNumber,
      jobType: cosignerCustomer.jobType,
      income: cosignerCustomer.declaredIncome,
    };

    loanAnalysisCosignerAuthenticity = {
      ip_address: '1.1.1.1',
      session_id: 'session',
      signable: cosignerScrSignature.signedFile,
    };
  }

  // I don't send expenses if the user don't want to add it to capital
  // if (!includeExpenses) {
  //   feesData["Expenses"] = 0;
  // }

  const signerData = {
    citizenNumber: customer.citizenNumber,
    jobType,
    income,
  };

  const analysis = await fetchLoanAnalysis({
    signer: signerData,
    application: applicationData,
    fees: feesData,
    cosigner: cosignerData,
    authenticity: loanAnalysisAuthenticity,
    cosignerAuthenticity: loanAnalysisCosignerAuthenticity,
    reference,
  });

  debug = {
    ...debug,
    BESMART: {
      REQUEST: {
        SIGNER: signerData,
        APPLICATION: applicationData,
        FEES: feesData,
        COSIGNER: cosignerData,
        authenticity: loanAnalysisAuthenticity,
      },
      RESPONSE: {
        ...(analysis && analysis),
      },
    },
  };
  if (!analysis) {
    throw new QuoteAnalysisException('Erro na recuperação de informações de BeSmart');
  }

  if (analysis.analysisWithError) {
    await Quote.update(
      {
        loanAnalysisCode: analysis.code,
        loanAnalysisReason: analysis.reason,
        loanAnalysisDecision: analysis.decision,
        loanAnalysisResult: analysis.result,
        loanAnalysisLogId: analysis.logId,
        loanMaxInstallmentAmount: analysis.maxInstallmentAmount,
        loans: analysis.loans,
      },
      {
        where: {
          id: quote.id,
        },
      },
    );

    await changeStatus({
      quoteId: quote.id,
      quoteStatusCode: 'analysis-rejected',
      userId,
      accountId,
      data: {
        request: {
          signer: signerData,
          application: applicationData,
          fees: feesData,
          cosigner: cosignerData,
        },
        response: {
          analysis,
        },
      },
    });

    await Offer.destroy({
      where: {
        consumerLoanRequestId: quote.id,
      },
    });
    throw new QuoteWithErrorException(analysis.TMP_BESMART.VEREDICT.Explanation, debug);
  }

  if (analysis.analysisWithRejection) {
    await Quote.update(
      {
        loanAnalysisCode: analysis.code,
        loanAnalysisReason: analysis.reason,
        loanAnalysisDecision: analysis.decision,
        loanAnalysisResult: analysis.result,
        loanAnalysisLogId: analysis.logId,
        loanMaxInstallmentAmount: analysis.maxInstallmentAmount,
        loans: analysis.loans,
      },
      {
        where: {
          id: quote.id,
        },
      },
    );

    await changeStatus({
      quoteId: quote.id,
      quoteStatusCode: 'analysis-rejected',
      userId,
      accountId,
      data: {
        request: {
          signer: signerData,
          application: applicationData,
          fees: feesData,
          cosigner: cosignerData,
          authenticity: loanAnalysisAuthenticity,
        },
        response: {
          loanAnalysisCode: analysis.code,
          loanAnalysisReason: analysis.reason,
          loanAnalysisDecision: analysis.decision,
          loanAnalysisResult: analysis.result,
          loanAnalysisLogId: analysis.logId,
        },
      },
    });

    await Offer.destroy({
      where: {
        consumerLoanRequestId: quote.id,
      },
    });

    throw new QuoteRejectException(analysis.result.message.ES, debug);
  }

  if (BESMART_DECISIONS.MANAGE.indexOf(analysis.decision.toUpperCase()) >= 0) {
    await Quote.update(
      {
        loanAnalysisCode: analysis.code,
        loanAnalysisReason: analysis.reason,
        loanAnalysisDecision: analysis.decision,
        loanAnalysisResult: analysis.result,
        loanAnalysisLogId: analysis.logId,
        loanMaxInstallmentAmount: analysis.maxInstallmentAmount,
        loans: analysis.loans,
      },
      {
        where: {
          id: quote.id,
        },
      },
    );
    await changeStatus({
      quoteId: quote.id,
      quoteStatusCode: 'analysis-rejected-manage',
      userId,
      accountId,
      data: {
        request: {
          signer: signerData,
          application: applicationData,
          fees: feesData,
          cosigner: cosignerData,
        },
        response: {
          loanAnalysisCode: analysis.code,
          loanAnalysisReason: analysis.reason,
          loanAnalysisDecision: analysis.decision,
          loanAnalysisResult: analysis.result,
          loanAnalysisLogId: analysis.logId,
        },
      },
    });
    await Offer.destroy({
      where: {
        consumerLoanRequestId: quote.id,
      },
    });
    throw new QuoteRejectException(analysis.result.message.ES, debug);
  }

  const amount: number = pAmount || inventory.vehiclePriceAmount;

  // const maxLoanUSD = await convert(
  //   CURRENCIES["UYU"],
  //   CURRENCIES["USD"],
  //   analysis.maxLoan
  // );
  // if (!maxLoanUSD) {
  //   throw new CurrencyException("Error converting max loan to USD");
  // }

  // const amountInUYU = await convert(
  //   CURRENCIES["USD"],
  //   CURRENCIES["UYU"],
  //   amount
  // );

  // if (!amountInUYU) {
  //   throw new CurrencyException("Error converting amount to UYU");
  // }

  // const approvedAmountUSD =
  //   amount < maxLoanUSD //amount viene en dolares del front , maxLoan en UYU de BeSmart.
  //     ? amount // convertir maxLoan en USD y
  //     : maxLoanUSD;

  // const approvedAmount =
  //   amountInUYU < analysis.maxLoan ? amountInUYU : analysis.maxLoan;

  const approvedAmount = amount < analysis.maxLoan ? amount : analysis.maxLoan;

  await Quote.update(
    {
      amount: approvedAmount,
      // amount: approvedAmountUSD,
      //amountInUYU: approvedAmount,  Ver Mañana! si agregamos esto así hay que modificar el modelo y la base.
      loanAnalysisCode: analysis.code,
      loanAnalysisReason: analysis.reason,
      loanAnalysisDecision: analysis.decision,
      loanAnalysisResult: analysis.result,
      loanAnalysisLogId: analysis.logId,
      loanMaxAmount: analysis.maxLoan, // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PARA MAÑANA, ESTO DEBERÏAMOS GUARDARLO EN USD?>>
      // loanMaxAmount: maxLoanUSD, // analysis.maxLoan,  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PARA MAÑANA, ESTO DEBERÏAMOS GUARDARLO EN USD?>>
      loanMaxInstallmentAmount: analysis.maxInstallmentAmount,
      loans: analysis.loans,
    },
    {
      where: {
        id: quote.id,
      },
    },
  );

  if ([BESMART_DECISIONS.APPROVE, BESMART_DECISIONS.VERIFY].indexOf(analysis.decision.toUpperCase()) >= 0) {
    let quoteStatusCode: keyof typeof QUOTE_STATUS | null;
    switch (analysis.decision.toUpperCase()) {
      case BESMART_DECISIONS.APPROVE:
        quoteStatusCode = 'analysis-approved';
        break;
      case BESMART_DECISIONS.VERIFY:
        quoteStatusCode = 'analysis-approved-verification';
        break;
      default:
        quoteStatusCode = null;
        break;
    }

    await changeStatus({
      quoteId: quote.id,
      quoteStatusCode: quoteStatusCode,
      userId,
      accountId,
      data: {
        request: {
          signer: signerData,
          application: applicationData,
          fees: feesData,
          cosigner: cosignerData,
        },
        response: {
          loanAnalysisCode: analysis.code,
          loanAnalysisReason: analysis.reason,
          loanAnalysisDecision: analysis.decision,
          loanAnalysisResult: analysis.result,
          loanAnalysisLogId: analysis.logId,
          // loanApprovedAmount: approvedAmountUSD,
          // loanMaxAmount: maxLoanUSD,
          loanApprovedAmount: approvedAmount,
          loanMaxAmount: amount,
          loanMaxInstallmentAmount: analysis.maxInstallmentAmount,
        },
      },
    });

    await calculateOffers({
      loanMaxAmount: analysis.maxLoan,
      loans: analysis.loans,
      approvedAmount,
      maxInstallmentAmount: analysis.maxInstallmentAmount,
      quoteId: quote.id,
      fees: getFees({
        borgesScore: customer.analysis.score,
        carAge,
        commissionId,
        gravamenStateCode,
      }),
      includeExpenses,
      gravamenAmount: feesData.Gravamen,
    });
  }

  // Update the Customers JobType and Reset the Analysis cache if the jobType is being provided
  if (customerChanged) {
    await clearCustomerAnalysisCache(String(customerId));
  }

  const responseQuote = await getQuote(quote.id);
  return {
    ...responseQuote,
    approvedAmount,
    debug,
  };
  // } catch (error) {
  //   console.log(error);
  //   console.log('TODO MAL', error);
  //   throw new QuoteException(error);
  // }
};

async function createOrUpdateQuote({
  newQuoteBody,
  leadId,
  inventoryId,
  userId,
  accountId,
}: {
  newQuoteBody: any;
  leadId: number | null;
  inventoryId: string;
  userId?: number | null;
  accountId?: number | null;
}): Promise<Quote | null> {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();
  conditions.set('leadId', { [Op.eq]: leadId });
  conditions.set('inventoryId', { [Op.eq]: inventoryId });
  // let orConditions: Map<string, any> = new Map();
  // orConditions.set("quoteInstanceId", {[Op.is]: null});
  // orConditions.set("quoteInstanceId", {
  //   [Op.or]: {
  //     [Op.is]: null,
  //     [Op.notIn]: Sequelize.literal(
  //       `(Select qi.id from quoteInstances qi where qi.code like 'not-interested%')`
  //     ),
  //   },
  // });

  where = Sequelize.and(
    Object.fromEntries(conditions),
    // Object.fromEntries(orConditions)
  );

  const quoteFetched = await Quote.findOne({
    where,
  });

  if (!quoteFetched) {
    let expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    const quote = await Quote.create({
      ...newQuoteBody,
      expirationDate: expiration,
      interest: newQuoteBody.interest || QUOTE_HIGHEST_INTEREST,
    });

    await changeStatus({
      quoteId: quote.id,
      quoteStatusCode: 'analysis-requested',
      userId,
      accountId,
      data: {
        recalculating: false,
      },
    });

    return quote;
  }

  await Quote.update(
    {
      ...newQuoteBody,
      quoteStatusReasonId: 0, // flushing reason on quote refresh
    },
    {
      where: {
        id: quoteFetched.id,
      },
    },
  );

  await changeStatus({
    quoteId: quoteFetched.id,
    quoteStatusCode: 'analysis-requested',
    userId,
    accountId,
    data: {
      recalculating: true,
    },
  });

  return await Quote.findByPk(quoteFetched.id, { raw: true, nest: true });
}

export async function changeStatus({
  quoteId,
  quoteStatusCode,
  quoteStatusId = null,
  quoteStatusReasonId = null,
  data = null,
  userId = CONSUMER_API_USER_ID,
  accountId = CONSUMER_ACCOUNT_ID,
}: {
  quoteId: number | string;
  quoteStatusCode?: keyof typeof QUOTE_STATUS | null;
  quoteStatusId?: number | null;
  quoteStatusReasonId?: number | null;
  data?: any | null;
  userId?: number | null;
  accountId?: number | null;
}): Promise<boolean> {
  let statusId = null;
  let statusReasonId = null;

  if (quoteStatusId && valueExistsInArray(QUOTE_STATUS, quoteStatusId)) {
    statusId = quoteStatusId;
  } else if (quoteStatusCode && quoteStatusCode in QUOTE_STATUS) {
    statusId = QUOTE_STATUS[quoteStatusCode];
  }
  if (!statusId) {
    console.error('Quote status not found');
    return false;
  }

  if (!quoteStatusReasonId) {
    statusReasonId = 0;
  } else {
    statusReasonId = quoteStatusReasonId;
  }

  try {
    await Quote.update(
      {
        quoteInstanceId: statusId,
        quoteStatusReasonId: statusReasonId,
      },
      {
        where: {
          id: quoteId,
        },
      },
    );

    await QuoteActivity.create({
      quoteId,
      quoteInstanceId: statusId,
      userId,
      accountId,
      data,
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    return false;
  }

  return true;
}

interface RequiredParametersFnProps {
  leadId: number | null;
  user?: Profile;
  accountId?: number | null;
  isDealer: boolean;
  pDeclaredIncome?: number | null;
  pJobType?: number | null;
  inventoryId: string;
}

async function checkRequiredParameters({
  leadId,
  user,
  accountId,
  isDealer,
  pDeclaredIncome,
  pJobType,
  inventoryId,
}: RequiredParametersFnProps) {
  const lead = leadId
    ? await Lead.findByPk(leadId, {
        nest: true,
        raw: true,
        include: [{ model: Account }],
      })
    : await Lead.findOne({
        where: {
          customerId: user?.customerId,
          accountId,
        },
        nest: true,
        raw: true,
        include: [{ model: Account }],
      });

  const customerId = isDealer ? lead?.customerId : user?.customerId;

  if (!lead) {
    throw new LeadNotFoundException();
  }

  let customer = await Customer.findOne({
    where: {
      id: customerId,
    },
  });
  if (!customer) {
    throw new CustomerNotFoundException();
  }

  const income = pDeclaredIncome || customer.declaredIncome || customer.estimatedIncome || 0;
  const jobType = pJobType || customer.jobType || 0;

  const customerChanged = pJobType !== customer.jobType || pDeclaredIncome !== customer.declaredIncome;

  // Update the Customers JobType and Reset the Analysis cache if the jobType is being provided
  if (customerChanged) {
    await Customer.update(
      {
        jobType,
        declaredIncome: income,
      },
      {
        where: {
          id: customerId,
        },
      },
    );
  }

  customer = await getCustomerById(customer.id);
  if (!customer) {
    throw new CustomerNotFoundException();
  }
  const inventoryAux = await Inventory.findOne({
    where: {
      id: inventoryId,
    },
  });
  if (!inventoryAux) {
    throw new InventoryNotFoundException();
  }

  const inventorySnapshot: InventorySnapshot = await getInventorySnapshot({
    leadId: lead.id,
    inventory: inventoryAux,
  });
  const inventory = inventorySnapshot ?? inventoryAux;

  return {
    lead,
    inventory,
    inventorySnapshot,
    customer,
    income,
    jobType,
    customerId,
    customerChanged,
  };
}

async function getInventorySnapshot({ leadId, inventory }: { leadId: number; inventory: Inventory }) {
  // inventorySnapshotLogic
  const existingQuote = await Quote.findOne({
    include: [
      {
        model: QuoteStatus,
        as: 'status',
      },
      {
        model: QuoteStatusReason,
      },
    ],
    where: {
      [Op.and]: [{ leadId: leadId }, { inventoryId: inventory.id }],
    },
    nest: true,
    raw: true,
  });

  let inventorySnapshot: InventorySnapshot | null;
  if (!existingQuote) {
    // If quote doesn't exist, snapshot doesn't either. Need to create
    inventorySnapshot = await createInventorySnapshot(inventory);
    if (!inventorySnapshot) {
      throw new InventoryNotFoundException();
    }
  } else if (!existingQuote.inventorySnapshotId) {
    inventorySnapshot = await createInventorySnapshot(inventory);
    if (!inventorySnapshot) {
      // If quote exists but FK to snapshot is null (legacy) create snapshot
      throw new InventoryNotFoundException();
    }
  } else {
    // If quote exists and is pointing to a snapshot, look for it.
    inventorySnapshot = await InventorySnapshot.findOne({
      where: {
        id: existingQuote.inventorySnapshotId,
      },
    });
    if (!inventorySnapshot) {
      throw new InventoryNotFoundException();
    }
    if (existingQuote.status.code === 'canceled') {
      refreshInventorySnapshot(inventorySnapshot);
    }
    if (existingQuote.quoteStatusReason.code === 'canceled-expired') {
      let newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + 7);
      await Quote.update(
        {
          expirationDate: newExpiration,
        },
        {
          where: {
            id: existingQuote.id,
          },
        },
      );
    }
  }
  // End of inventorySnapshotLogic

  return inventorySnapshot;
}

export const getDealerCommission = async (
  dealerCommissionTableId: number,
  customerAnalysisScore: string,
  inventoryAge: number,
): Promise<number> => {
  if (!dealerCommissionTableId || dealerCommissionTableId < 1) {
    throw new Error('getDealerCommission: Tabela de Comissão é necessária');
  }
  if (!customerAnalysisScore || isEmpty(customerAnalysisScore)) {
    throw new Error('getDealerCommission: Borges Score é necessário');
  }
  if (inventoryAge === null || inventoryAge === undefined || inventoryAge < 0) {
    throw new Error('getDealerCommission: A idade do carro é necessária');
  }

  const res = await DealerCommission.findOne({
    where: {
      dealerCommissionTableId,
      customerAnalysisScore,
      inventoryAge,
    },
    raw: true,
  });

  if (!res) {
    console.log(
      'getDealerCommission commission not found! dealerCommissionTableId, customerAnalysisScore, inventoryAge',
      dealerCommissionTableId,
      customerAnalysisScore,
      inventoryAge,
    );
    //   throw new Error('getDealerCommission: % da comissão nao encontrado');
  }

  return res ? parseFloat(String(res.amount)) : 0; // Better null than cero to prevent false commissions for internal errors
};
