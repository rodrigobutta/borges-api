import formatNumber from 'format-number';

export const formattedCurrency = (number: number, prefix = 'R$ ') =>
  formatNumber({
    prefix,
    integerSeparator: '.',
    padRight: 0,
    round: 0,
    decimal: ',',
    suffix: '',
  })(number);

export const formattedPercentage = (number: number) =>
  formatNumber({
    prefix: '',
    integerSeparator: '.',
    padRight: 2,
    round: 2,
    decimal: ',',
    suffix: '%',
  })(number);

export const formattedNumber = (number: number) =>
  formatNumber({
    integerSeparator: '.',
    padRight: 2,
    round: 2,
    decimal: ',',
    suffix: '',
  })(number);

export default (value: string, type: string) => {
  switch (type) {
    case 'currency':
      return value ? formattedCurrency(parseFloat(value)) : '-';

    case 'number':
      return value ? formattedNumber(parseFloat(value)) : '-';

    case 'percentage':
      return value ? formattedPercentage(parseFloat(value)) : '-';

    default:
      return value;
  }
};
