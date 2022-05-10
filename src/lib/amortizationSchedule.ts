const moment = require('moment');

const getPeriodicPayment = (rate: number, term: number, principal: number) =>
  (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);

// const getPay = (rate: number, term: number, principal: number) =>
//   (principal * rate) / (1 - Math.pow(1 + rate, -term));

const getAmortizationSchedule = (props: {
  principal: number;
  term: number;
  rate: number;
  iva: number;
  feeAdministrative: number;
  insuranceRate: number;
  totalRate: number;
}) => {
  const { principal, term, rate, iva, feeAdministrative, insuranceRate, totalRate } = props;

  let payments = [];
  let remainingPrincipal = principal;
  // let totalInsurance = 0;

  // const pay = getPay(rate, term, principal);

  const periodicPayment = getPeriodicPayment(totalRate * (1 + iva), term, principal);

  // console.log(periodicPayment);

  // const feeAdministrativeWithIVA = feeAdministrative * (1 + iva);

  // for (let n = 1; n <= term; n++) {
  //   const interest = (remainingPrincipal * rate) / (1 + iva);
  //   const ivaToPay = interest * iva;
  //   const amortization = pay - interest - ivaToPay;
  //   totalInsurance +=
  //     (remainingPrincipal + interest + ivaToPay) * Number(insuranceRate);
  //   remainingPrincipal = remainingPrincipal - amortization;

  //   payments.push({
  //     n: n,
  //     remainingPrincipal: remainingPrincipal,
  //     amortization: amortization,
  //     interest: interest,
  //     iva: ivaToPay,
  //     administrativeFee: feeAdministrativeWithIVA,
  //     periodPayment: pay + feeAdministrativeWithIVA,
  //   });
  // }

  // return payments.map((payment: any) => {
  //   payment.periodPayment = payment.periodPayment + totalInsurance / term;
  //   return { ...payment, insurance: totalInsurance / term };
  // });

  let sumInsuranceAmount = 0;

  for (let n = 1; n <= term; n++) {
    // let insurance = remainingPrincipal * Number(insuranceRate);
    let ivaInsurance = 0; // No lleva IVA
    let interest = remainingPrincipal * rate;
    let ivaToPay = interest * iva;
    let insurance = (remainingPrincipal + interest + ivaToPay) * Number(insuranceRate);
    let amortization = periodicPayment - ivaToPay - interest;
    remainingPrincipal = remainingPrincipal - amortization;

    sumInsuranceAmount += insurance;

    payments.push({
      n: n,
      remainingPrincipal: remainingPrincipal,
      amortization: amortization,
      interest: interest,
      iva: ivaToPay,
      administrativeFee: feeAdministrative,
      insurance,
      ivaInsurance,
      periodPayment: periodicPayment + feeAdministrative,
    });
  }
  const insuranceFee = sumInsuranceAmount / term;

  return payments.map(p => {
    p.periodPayment += insuranceFee;
    return { ...p, insuranceFee };
  });
};

export default function getPaymentDates(props: {
  principal: number;
  iva: number;
  rate: number;
  term: number;
  feeAdministrative: number;
  totalRate: number;
  insuranceRate: number;
}) {
  const { principal, iva, rate, term, feeAdministrative, totalRate, insuranceRate } = props;
  if (!term) {
    return [];
  }
  const amortizationSchedule = getAmortizationSchedule({
    principal,
    rate,
    feeAdministrative: feeAdministrative * (1 + iva),
    iva,
    term,
    totalRate,
    insuranceRate,
  });

  const schedule = amortizationSchedule.map(payment => {
    const date = moment()
      .add(payment.n * 30, 'days')
      .format('YYYY-MM-DD');
    return { date, ...payment };
  });

  return schedule;
}
