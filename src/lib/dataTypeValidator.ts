import _ from 'lodash';
//import _ from "lodash";  ??
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { DateTime } from 'luxon';

import { phoneParser } from './phoneNumberParser';
import format from '../utils/format';

export const FIELD_TYPES = {
  CAR_PICKER: 'carPicker',
  CHECKBOX: 'checkbox',
  CURRENCY: 'currency',
  DATE: 'date',
  EMAIL: 'email',
  PHONE: 'phone',
  CPF: 'cpf',
  CNPJ: 'cnpj',
  INTEGER: 'integer',
  NUMBER: 'number',
  PASSWORD: 'password',
  PERCENTAGE: 'percentage',
  RADIO_BUTTON: 'radioButton',
  RELATIVE_TIME: 'relative_time',
  JSON: 'json',
  SELECT: 'select',
  TEXT: 'text',
};

// const ALLOWED_DATE_FORMATS = ["DD/MM/YYYY", "YYYY-MM-DD"];

/* const validateDate = (dateString) => {
  return (
    !dateString ||
    dateString === "" ||
    moment(dateString, ALLOWED_DATE_FORMATS, true).isValid()
  );
}; */

const validateDate = (dateString: string) => {
  return (
    !dateString || dateString === '' || DateTime.fromSQL(dateString).isValid // TODO: valid date but, formats?
  );
};

const validateInteger = (number: number) => Number.isInteger(Number(number));

const validateEmail = (string: string) => /\S+@\S+\.\S+/.test(string);

const validateText = (string: string) => /^[ÁáÉéÍíÓóÚúÑñA-Za-z _]*[ÁáÉéÍíÓóÚúÑñA-Za-z][ñA-Za-z _]*$/.test(string);

const getRequiredFields = (fields: any) => fields.filter((x: any) => x.qiTechMandatory);

const getEmailFields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.EMAIL);

const getDateFields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.DATE);

const getPhoneFields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.PHONE);

const getCPF_Fields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.CPF);

const getCNPJ_Fields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.CNPJ);

const getNumberFields = (fields: any) =>
  fields.filter((x: any) => x.type === 'areaCode' || x.type === 'number' || x.type === 'currency');

const getCheckboxFields = (fields: any) => fields.filter((x: any) => x.type === 'checkbox');

const getIntegerFields = (fields: any) => fields.filter((x: any) => x.type === FIELD_TYPES.INTEGER);

const getTextFields = (fields: any) =>
  fields.filter((x: any) => x.type === undefined || x.type === 'text' || x.type === 'password');

// const format = (value: string) => formatNumber(value, "NATIONAL", ".");

const validator = (entity: any, fields: any) => {
  let errors = {};

  // Fix checkbox bad syntax
  getCheckboxFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) === null || _.get(entity, field.name) === 0 || _.get(entity, field.name) === '0') {
      _.set(entity, field.name, false);
    }
    if (_.get(entity, field.name) === 1 || _.get(entity, field.name) === '1') {
      _.set(entity, field.name, true);
    }
  });

  getRequiredFields(fields).forEach((field: any) => {
    if (_.isNil(_.get(entity, field.name)) || _.get(entity, field.name) === '') {
      _.set(errors, field.name, field.error || 'Este campo é obrigatório');
    }
  });

  getEmailFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !validateEmail(_.get(entity, field.name))) {
      _.set(errors, field.name, field.error || 'Formato Incorreto');
    }
  });

  getPhoneFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !phoneParser(_.get(entity, field.name)).isValid) {
      _.set(errors, field.name, field.error || 'O numero é inválido: ' + _.get(entity, field.name));
    }
  });

  getCPF_Fields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !cpf.isValid(_.get(entity, field.name))) {
      _.set(errors, field.name, field.error || 'O numero cpf é inválido');
    }
  });

  getCNPJ_Fields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !cnpj.isValid(_.get(entity, field.name))) {
      _.set(errors, field.name, field.error || 'O numero cnpj é inválido');
    }
  });

  getIntegerFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !validateInteger(_.get(entity, field.name))) {
      _.set(errors, field.name, field.error || 'El valor tiene que ser un numero entero');
    }
  });

  getNumberFields(fields).forEach((field: any) => {
    if (field.max && _.get(entity, field.name) > field.max) {
      _.set(errors, field.name, `Valor máximo ${format(field.max, FIELD_TYPES.NUMBER)}`);
    } else if (field.min && _.get(entity, field.name) < field.min) {
      _.set(errors, field.name, `Valor mínimo ${format(field.min, FIELD_TYPES.NUMBER)}`);
    }
  });

  getDateFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name) && !validateDate(_.get(entity, field.name))) {
      _.set(errors, field.name, field.error || 'Formato Incorreto');
    }
  });

  getTextFields(fields).forEach((field: any) => {
    if (_.get(entity, field.name)) {
      if (field.letterOnly && !validateText(_.get(entity, field.name))) {
        _.set(errors, field.name, field.error || 'Solo se permiten letras');
      } else if (field.max && _.get(entity, field.name).length > field.max) {
        _.set(errors, field.name, `Máximo ${field.max.toString()} caracteres`);
      } else if (field.min && _.get(entity, field.name).length < field.min) {
        _.set(errors, field.name, `Mínimo ${field.min.toString()} caracteres`);
      } else if (field.noSpaces && _.get(entity, field.name).indexOf(' ') > 0) {
        _.set(errors, field.name, 'No se permiten espacios');
      }
    }
  });

  return errors;
};

export { validator };
