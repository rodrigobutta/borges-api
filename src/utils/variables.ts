import { Variable } from '../models/Variable';

const getValue = async (name: string) => {
  try {
    const response = await Variable.findOne({
      where: { name },
      // raw: true,
    });

    if (!response) {
      return null;
    }

    return response.value;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const setValue = async (name: string, value: any) => {
  try {
    await Variable.upsert({
      name,
      value,
    });

    return value;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getValue,
  setValue,
};
