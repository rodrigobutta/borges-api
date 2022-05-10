import { StateGravamen } from '../models/StateGravamen';

export const getGravamenAmount = async (stateCode: string) => {
  if (!stateCode) {
    throw new Error('getGravamenAmount: Codigo de Estado é necessário');
  }

  const res = await StateGravamen.findOne({
    where: {
      stateCode,
    },
  });

  return res ? parseFloat(String(res.amount)) : null; // Better null than cero to prevent false gravamens for internal errors
};
