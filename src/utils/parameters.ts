import { Parameter } from '../models/Parameter';

export const getSpace = async (spaceName: string, defaultResponse: any = {}) => {
  const space = spaceName.toLowerCase();

  try {
    const parameters = await Parameter.findAll({
      attributes: ['name', 'value', 'valueJSON'],
      where: {
        space,
      },
    });
    if (!parameters) {
      return defaultResponse;
    }

    return parameters.reduce(
      (acc, r) => ({
        ...acc,
        [r.name]: r.value || r.valueJSON,
      }),
      {},
    );
  } catch (error) {
    return defaultResponse;
  }
};

export const getParameter = async (spaceName: string, parameterName: string, defaultValue: any = null) => {
  try {
    const space = spaceName.toUpperCase();
    const name = parameterName.toUpperCase();

    const parameter = await Parameter.findOne({
      where: {
        space,
        name,
      },
    });
    if (!parameter) {
      return defaultValue;
    }

    return parameter.value || parameter.valueJSON;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
