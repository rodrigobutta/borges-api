import { isNil } from 'lodash';

export interface IValidation {
  group?: string;
  field: string;
  label?: string;
  message: string;
}

const stripValidation = (arr: any, group: string | null = null): IValidation[] =>
  arr
    ? Object.keys(arr).reduce((acc, p) => {
        let val: IValidation = {
          ...(group && { group }),
          field: `${p}`,
          // field: `${fieldPrefix} ${p}`,
          message: arr[p],
        };

        const remap = LOAN_APPLICATION_FIELDS.find(rem => rem.name === p);
        if (remap) {
          val = {
            ...val,
            group: remap.group,
            label: remap.label,
          };
        }

        return [...acc, { ...val }];
      }, [] as IValidation[])
    : [];

const stripFrontendValidation = (arr: any, group: string): IValidation[] => {
  console.log('stripFrontendValidation', arr);
  return arr
    ? arr.reduce((acc: any, p: any) => {
        let val: IValidation = {
          ...(group && { group }),
          field: ``,
          message: p,
        };

        const remap = LOAN_APPLICATION_FIELDS.find(rem => rem.name === p);
        if (remap) {
          val = {
            ...val,
            group: `${val.group} > ${remap.group}`,
            label: remap.label,
          };
        }

        return [...acc, { ...val }];
      }, [] as IValidation[])
    : [];
};

// TODO REB no comments...
export const resumeValidations = (validationsRaw: any): IValidation[] => {
  console.log('resumeValidations', validationsRaw);
  if (!validationsRaw) {
    return [];
  }

  let res = [] as IValidation[];

  res = [
    ...stripValidation(validationsRaw.buyerErrors?.person.buyer, 'Financiado/Comprador'),
    ...stripValidation(validationsRaw.coupleErrors?.person.couple, 'Cônjuge'),
    ...stripValidation(validationsRaw.cosignerErrors?.person.cosigner, 'Devedor Solidário'),
    ...stripValidation(validationsRaw.inventoryErrors, 'Veículo'),
    ...stripValidation(validationsRaw.accountErrors, 'Conta'),
    ...stripValidation(validationsRaw.fileErrors, 'Arquivo'),
  ];

  console.log('res1', res);

  if (!isNil(validationsRaw.sections)) {
    res = [
      ...res,
      ...stripFrontendValidation(
        validationsRaw.sections
          .find((e: any) => e.id === 'datos-registro')
          ?.sections?.find((e: any) => e.id === 'buyer').errors,
        'Comprador',
      ),
      ...stripFrontendValidation(
        validationsRaw.sections
          .find((e: any) => e.id === 'datos-registro')
          ?.sections?.find((e: any) => e.id === 'couple').errors,
        'Cónyuge',
      ),
      ...stripFrontendValidation(
        validationsRaw.sections
          .find((e: any) => e.id === 'datos-registro')
          ?.sections?.find((e: any) => e.id === 'cosigner').errors,
        'Cosignatario',
      ),
      ...stripFrontendValidation(
        validationsRaw.sections.find((e: any) => e.id === 'datos-vehiculo')?.sections[0]?.errors,
        'Dados Do Veículo',
      ),
      ...stripFrontendValidation(
        validationsRaw.sections.find((e: any) => e.id === 'datos-account')?.sections[0]?.errors,
        'Preferencias',
      ),
    ];
  }

  return res;
};

export const LOAN_APPLICATION_FIELDS = [
  {
    group: 'Dados Pessoais',
    name: 'firstName',
    label: 'Nome',
  },
  {
    group: 'Dados Pessoais',
    name: 'lastName',
    label: 'Sobrenome',
  },
  {
    group: 'Dados Pessoais',
    name: 'birthDate',
    label: 'Data de nascimento',
  },
  {
    group: 'Dados Pessoais',
    name: 'birthPlace',
    label: 'Nascido em',
  },
  {
    group: 'Dados Pessoais',
    name: 'birthCountry',
    label: 'Nacionalidade',
  },
  {
    group: 'Dados Pessoais',
    name: 'rg',
    label: 'RG',
  },
  {
    group: 'Dados Pessoais',
    name: 'emitter',
    label: 'Emissor',
  },
  {
    group: 'Dados Pessoais',
    name: 'emitionDate',
    label: 'Data emissão',
  },
  {
    group: 'Dados Pessoais',
    name: 'fathersName',
    label: 'Nome do pai',
  },
  {
    group: 'Dados Pessoais',
    name: 'mothersName',
    label: 'Nome da mae',
  },
  {
    group: 'Dados Pessoais',
    name: 'cpf',
    label: 'CPF',
  },
  {
    group: 'Dados Pessoais',
    name: 'cnh',
    label: 'CNH',
  },
  {
    group: 'Dados Pessoais',
    name: 'gender',
    label: 'Sexo',
  },
  {
    group: 'Dados Pessoais',
    name: 'civilStatus',
    label: 'Estado Civil',
  },
  {
    group: 'Dados Pessoais',
    name: 'dependents',
    label: 'Nr. de Dependentes',
  },
  {
    group: 'Dados Pessoais',
    name: 'studies',
    label: 'Escolaridade',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeType',
    label: 'Tipo de Residencia',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeRent',
    label: 'Valor mensal',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeAge',
    label: 'Tempo de residencia',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeAddress',
    label: 'Endereço',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeAddressNumber',
    label: 'Número',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeNeighbour',
    label: 'Bairro',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeCep',
    label: 'CEP',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeCity',
    label: 'Cidade',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeState',
    label: 'Estado',
  },
  {
    group: 'Endereço Residencial',
    name: 'homePhone',
    label: 'Tel.Fixo',
  },
  {
    group: 'Endereço Residencial',
    name: 'homePhoneCountryCode',
    label: 'Tel.Fixo (Código do país)',
  },
  {
    group: 'Endereço Residencial',
    name: 'homePhoneAreaCode',
    label: 'Tel.Fixo (Código de área)',
  },
  {
    group: 'Endereço Residencial',
    name: 'homeComments',
    label: 'Complemento',
  },
  {
    group: 'Endereço Residencial',
    name: 'cellPhone',
    label: 'Tel.Celular',
  },
  {
    group: 'Endereço Residencial',
    name: 'cellPhoneCountryCode',
    label: 'Tel.Celular (Código do país)',
  },
  {
    group: 'Endereço Residencial',
    name: 'cellPhoneAreaCode',
    label: 'Tel.Celular (Código de área)',
  },
  {
    group: 'Endereço Residencial',
    name: 'personalEmail',
    label: 'E-mail Pessoal',
  },
  {
    name: 'professionalEmail',
    label: 'E-mail Profissional',
  },
  {
    group: 'Dados de Trabalho',
    name: 'profession',
    label: 'Profissão',
  },
  {
    group: 'Dados de Trabalho',
    name: 'isPep',
    label: 'PeP',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyName',
    label: 'Empresa',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyCnpj',
    label: 'CNPJ',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyPhone',
    label: 'Tel.Fixo',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyNeighbour',
    label: 'Bairro',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyCep',
    label: 'CEP',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyCity',
    label: 'Cidade',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyState',
    label: 'Estado',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyJobPossition',
    label: 'Cargo',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyRelation',
    label: 'Vínculo',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyStartDate',
    label: 'Data de admissão',
  },
  {
    group: 'Dados de Trabalho',
    name: 'companyMainSalaryAmount',
    label: 'Renda principal',
  },
  {
    name: 'companyMainSalaryCheck',
    label: 'Renda principal (Comprovação)',
  },
  {
    name: 'companySecondaryAmount',
    label: 'Renda adicional',
  },
  {
    name: 'companySecondaryCheck',
    label: 'Renda adicional (Comprovação)',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankName',
    label: 'Banco',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankFromDate',
    label: 'Cliente desde',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankCredit',
    label: 'bankCredit',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankAccountType',
    label: 'bankAccountType',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankAgency',
    label: 'bankAgency',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankAccountNumber',
    label: 'bankAccountNumber',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankCheckLimit',
    label: 'bankCheckLimit',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankContactName',
    label: 'bankContactName',
  },
  {
    group: 'Referencias Bancárias',
    name: 'bankContactPhone',
    label: 'Telefone',
  },
  {
    group: 'Referencias Bancárias',
    name: 'hadGravamen',
    label: 'hadGravamen',
  },
  {
    group: 'Arquivos',
    name: 'vehicleCRVFileKey',
    label: 'CRV',
  },
];
