import { CurrencyExchange } from '../models/CurrencyExchange';
import { Profile } from '../models/Profile';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const getExchange = async (from: Currency['code'], to: Currency['code']) => {
  try {
    const fromClean = from.toUpperCase();
    const toClean = to.toUpperCase();

    const exchange = await CurrencyExchange.findOne({
      include: [
        {
          model: Profile,
          attributes: ['firstName', 'lastName', 'email', 'role'],
        },
      ],
      where: {
        from: fromClean,
        to: toClean,
      },
      order: [['id', 'DESC']],
    });
    if (!exchange) {
      return null;
    }

    return exchange;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const convert = async (from: Currency['code'], to: Currency['code'], value: number) => {
  try {
    const exchange = await getExchange(from, to);
    if (!exchange) {
      return null;
    }

    const result = exchange.value * value;

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
