const yup = require('yup');

yup.setLocale({
  mixed: {
    default: 'Este dato no es válido.',
    // required: 'Este campo es obligatorio.',
    required: '${path}: este campo é obrigatório.',
  },
  number: {
    min: 'Debe ser mayor a ${min}',
  },
});

const yupOptions = {
  abortEarly: false, // collect and return all errors. If true: Throw on the first error,
};

export const validate = async (schema: any, data: any) => {
  await schema.validate(data, yupOptions);
};

export const RULES = (label?: string) => {
  const _label = label || '';
  return {
    DATE_DEFAULT_REQUIRED: yup.string().ensure().label(_label).required(), // TODO verificar reglas para este tipo
    NUMBER_DEFAULT_REQUIRED: yup.number().label(_label).required(), // TODO verificar reglas para este tipo
    STRING_DEFAULT_REQUIRED: yup.string().ensure().label(_label).required(),
  };
};
