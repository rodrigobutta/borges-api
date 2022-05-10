const yup = require('yup');

import { RULES } from '../utils/validator';

// YUP SCHEMAS Application createRevision
export const buyerSchema = yup.object().shape({
  // Personal Data
  firstName: RULES('Nome/s').STRING_DEFAULT_REQUIRED,
  lastName: RULES('Sobrenome/s').STRING_DEFAULT_REQUIRED,
  birthDate: RULES('Data de nascimento').STRING_DEFAULT_REQUIRED,
  birthPlace: RULES('Nascido em').STRING_DEFAULT_REQUIRED,
  citizenNumber: RULES('CPF').STRING_DEFAULT_REQUIRED, // TODO move to citizenNumber ?
  // identityCardExpirationDate: RULES('Fecha de vencimiento C.I.').STRING_DEFAULT_REQUIRED,
  gender: RULES('Sexo').STRING_DEFAULT_REQUIRED,
  civilStatus: RULES('Estado Civil').STRING_DEFAULT_REQUIRED,
  cellPhone: RULES('Telefone Celular').STRING_DEFAULT_REQUIRED,
  // homePhone: RULES('Teléfone').STRING_DEFAULT_REQUIRED,
  personalEmail: RULES('E-mail personal').STRING_DEFAULT_REQUIRED,
  // Residence Data
  homeAddress: RULES('Endereço Residencial').STRING_DEFAULT_REQUIRED,
  homeCep: RULES('CEP').STRING_DEFAULT_REQUIRED,
  homeCity: RULES('Cidade').STRING_DEFAULT_REQUIRED,
  // homeNeighbour: RULES('Barrio').STRING_DEFAULT_REQUIRED,
  homeState: RULES('Estado').STRING_DEFAULT_REQUIRED,
  // residenceCountry: RULES('País de residencia').STRING_DEFAULT_REQUIRED,
  // Work Data
  companyName: RULES('Empresa').STRING_DEFAULT_REQUIRED,
  companyJobPossition: RULES('Cargo').STRING_DEFAULT_REQUIRED,
  companyMainSalaryAmount: RULES('Renda Principal').STRING_DEFAULT_REQUIRED,
  // companyNeighbour: RULES('Dados de Trabalho: bairro').STRING_DEFAULT_REQUIRED,
  // companyCity: RULES('Dados de Trabalho: Cidade').STRING_DEFAULT_REQUIRED,
  companyState: RULES('Dados de Trabalho: Estado').STRING_DEFAULT_REQUIRED,
  // companyPhone: RULES('Dados de Trabalho: Telefone').STRING_DEFAULT_REQUIRED,
  companyRelation: RULES('Dados de Trabalho: Vínculo').STRING_DEFAULT_REQUIRED,
});

export const coupleSchema = yup.object().shape({
  // Personal Data
  firstName: RULES('Nome/s').STRING_DEFAULT_REQUIRED,
  lastName: RULES('Sobrenome/s').STRING_DEFAULT_REQUIRED,
  birthDate: RULES('Data de nascimento').STRING_DEFAULT_REQUIRED,
  birthPlace: RULES('Nascido em').STRING_DEFAULT_REQUIRED,
  citizenNumber: RULES('CPF').STRING_DEFAULT_REQUIRED, // TODO move to citizenNumber ?
  // identityCardExpirationDate: RULES('Fecha de vencimiento C.I.').STRING_DEFAULT_REQUIRED,
  gender: RULES('Sexo').STRING_DEFAULT_REQUIRED,
  civilStatus: RULES('Estado Civil').STRING_DEFAULT_REQUIRED,
  cellPhone: RULES('Telefone Celular').STRING_DEFAULT_REQUIRED,
  homePhone: RULES('Telefone').STRING_DEFAULT_REQUIRED,
  personalEmail: RULES('E-mail personal').STRING_DEFAULT_REQUIRED,
  // Residence Data
  homeAddress: RULES('Endereço Residencial').STRING_DEFAULT_REQUIRED,
  homeCep: RULES('CEP').STRING_DEFAULT_REQUIRED,
  homeCity: RULES('Cidade').STRING_DEFAULT_REQUIRED,
  // homeNeighbour: RULES('Barrio').STRING_DEFAULT_REQUIRED,
  homeState: RULES('Estado').STRING_DEFAULT_REQUIRED,
  // residenceCountry: RULES('País de residencia').STRING_DEFAULT_REQUIRED,
  // Work Data
  companyName: RULES('Empresa').STRING_DEFAULT_REQUIRED,
  companyJobPossition: RULES('Cargo').STRING_DEFAULT_REQUIRED,
  companyMainSalaryAmount: RULES('Renda Principal').STRING_DEFAULT_REQUIRED,
  // companyNeighbour: RULES('Barrio Empresa').STRING_DEFAULT_REQUIRED,
  companyCity: RULES('Dados de Trabalho: Cidade').STRING_DEFAULT_REQUIRED,
  companyState: RULES('Dados de Trabalho: Estado ').STRING_DEFAULT_REQUIRED,
  companyPhone: RULES('Dados de Trabalho: Telefone').STRING_DEFAULT_REQUIRED,
  companyRelation: RULES('Dados de Trabalho: Vínculo').STRING_DEFAULT_REQUIRED,
});

export const inventorySchema = yup.object().shape({
  vehicleBrandName: RULES('Marca').STRING_DEFAULT_REQUIRED,
  vehicleModelName: RULES('Modelo').STRING_DEFAULT_REQUIRED,
  vehicleYear: RULES('Ano Modelo').STRING_DEFAULT_REQUIRED,
  licensePlate: RULES('Placa').STRING_DEFAULT_REQUIRED,
  assemblyYear: RULES('Ano de fabricação').NUMBER_DEFAULT_REQUIRED,
  renavam: RULES('Renavam').STRING_DEFAULT_REQUIRED,
  color: RULES('Color').STRING_DEFAULT_REQUIRED,
  mileage: RULES('Quilometragem').NUMBER_DEFAULT_REQUIRED,
  vehiclePriceAmount: RULES('Avaliação').NUMBER_DEFAULT_REQUIRED,
  // registrationNumber: RULES('Nro. de Empadronamiento').STRING_DEFAULT_REQUIRED,
  // vehicleResidenceLocation: RULES('Dpto. de Empadronamiento').STRING_DEFAULT_REQUIRED,
});

export const accountSchema = yup.object().shape({
  name: RULES('Nome Automotora').STRING_DEFAULT_REQUIRED,
  bankAccountNumber: RULES('Número da Conta Bancária').STRING_DEFAULT_REQUIRED,
  bankName: RULES('Banco').STRING_DEFAULT_REQUIRED,
});
