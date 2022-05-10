import { CurrencyExchange } from '../models/CurrencyExchange';
import { Profile } from '../models/Profile';

export const getExchange = async (from: string, to: string) => {
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

export const convert = async (from: string, to: string, value: number) => {
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
