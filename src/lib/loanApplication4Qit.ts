import { LoanAppErrors, DocumentIdentification } from '../interfaces/Item';
import { upload } from '../providers/qitech';
import { Account } from '../models/Account';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { DateTime } from 'luxon';
import { fullName } from '../utils/userUtils';
import _ from 'lodash';
import nextBizDayByCountry from './nextBizDayByCountry';
import { phoneParser } from './phoneNumberParser';
import { parsedRebates } from '../utils/loanApplicationUtils';
import { LoanApplicationDTO } from '../dto/LoanApplicationDTO';
import { dataTypeParser } from './dataFieldParser';
import { validator } from './dataTypeValidator';
import { deleteKeyIfNull } from '../utils/common';
import { LoanApplication } from '../models/LoanApplication';
import formatNumber from 'format-number';

async function updFile(fieldName: string, file: any, dkey: any, id: any) {
  const newFile = { ...file, qit_key: dkey };
  await LoanApplication.update({ [fieldName]: newFile }, { where: { id } });
}

// Field Validations
export async function checkLoanApp(loanApp: LoanApplicationDTO) {
  let errors: Partial<LoanAppErrors> = {};

  let residenceFileKey: Partial<DocumentIdentification> = {},
    cpfFileKey: Partial<DocumentIdentification> = {},
    vehicleRegCertFilekey: Partial<DocumentIdentification> = {},
    weddingFileKey: Partial<DocumentIdentification> = {},
    coupleRgFileKey: Partial<DocumentIdentification> = {},
    garantRgFileKey: Partial<DocumentIdentification> = {},
    garantAddressFileKey: Partial<DocumentIdentification> = {};

  if (loanApp.person?.buyer) {
    const parsedBuyer = dataTypeParser('buyer');
    const fieldsToCheck: any[] = parsedBuyer[0].fields.concat(parsedBuyer[1].fields).concat(parsedBuyer[2].fields);
    errors.buyerErrors = validator(loanApp, fieldsToCheck);

    if (_.isEmpty(errors.buyerErrors)) {
      if (!loanApp.addressVoucher) {
        _.set(errors, 'fileErrors.addressVoucher', 'Arquivo está faltando');
      } else {
        try {
          residenceFileKey = await upload(loanApp.addressVoucher, String(loanApp.id));
          updFile('addressVoucher', loanApp.addressVoucher, residenceFileKey.document_key, loanApp.id);
        } catch (error) {
          _.set(
            errors,
            'qiTechErrors.addressVoucher',
            'Something went wrong sending Probe of Residence Certificate file to QiTech',
          );
        }
      }

      if (!loanApp.rg) {
        _.set(errors, 'fileErrors.rg', 'Arquivo está faltando');
      } else {
        try {
          cpfFileKey = await upload(loanApp.rg, String(loanApp.id));
          updFile('rg', loanApp.rg, cpfFileKey.document_key, loanApp.id);
        } catch (error) {
          _.set(errors, 'qiTechErrors.rg', 'Something went wrong sending CPF file to QiTech');
        }
      }

      if (!loanApp.vehicleRegistryCertificate && loanApp.inventory?.new) {
        _.set(errors, 'fileErrors.vehicleCRVFileKey', 'Arquivo está faltando');
      } else {
        try {
          vehicleRegCertFilekey = await upload(loanApp.vehicleRegistryCertificate, String(loanApp.id));
          updFile(
            'vehicleRegistryCertificate',
            loanApp.vehicleRegistryCertificate,
            vehicleRegCertFilekey.document_key,
            loanApp.id,
          );
        } catch (error) {
          _.set(
            errors,
            'qiTechErrors.vehicleRegistryCertificate',
            'Something went wrong sending Vehicle Certificate file to QiTech',
          );
        }
      }
      if (!cpfFileKey) {
        _.set(errors, 'qiTechErrors.CPFnullFileKey', 'QiTech returned a null key in buyer CPF or CNH file');
      }
      if (!vehicleRegCertFilekey) {
        _.set(errors, 'qiTechErrors.CRVnullFileKey', 'QiTech returned a null key in buyer CRV file');
      }
      if (!residenceFileKey) {
        _.set(
          errors,
          'qiTechErrors.residenceNullFileKey',
          'QiTech returned a null key in buyer Residence Certificate file ',
        );
      }
    }
  }

  if (loanApp.person?.couple) {
    const parsedCouple = dataTypeParser('couple');
    const fieldsToCheck = parsedCouple[0].fields.concat(parsedCouple[1].fields).concat(parsedCouple[2].fields);
    errors.coupleErrors = validator(loanApp, fieldsToCheck);

    if (_.isEmpty(errors.coupleErrors)) {
      try {
        coupleRgFileKey = await upload(loanApp.auxiliarDocument2, String(loanApp.id));
        updFile('auxiliarDocument2', loanApp.vehicleRegistryCertificate, coupleRgFileKey, loanApp.id);
      } catch (error) {
        _.set(errors, 'qiTechErrors.CoupleRG', 'Something went wrong sending couple RG file to QiTech');
      }
      try {
        weddingFileKey = await upload(loanApp.auxiliarDocument1, String(loanApp.id));
        updFile('auxiliarDocument1', loanApp.auxiliarDocument1, weddingFileKey, loanApp.id);
      } catch (error) {
        _.set(errors, 'qiTechErrors.weddingFile', 'Something went wrong sending Wedding Certificate file to QiTech');
      }
      if (!weddingFileKey) {
        _.set(errors, 'qiTechErrors.nullFileKey', 'QiTech returned a null key in couple Wedding Certificate file');
      }
      if (!coupleRgFileKey) {
        _.set(errors, 'qiTechErrors.nullFileKey', 'QiTech returned a null key in couple RG file');
      }
    }
  }

  if (loanApp.person?.garant) {
    const parsedGarant = dataTypeParser('garant');
    const fieldsToCheck = parsedGarant[0].fields.concat(parsedGarant[1].fields).concat(parsedGarant[2].fields);
    errors.garantErrors = validator(loanApp, fieldsToCheck);

    if (_.isEmpty(errors.garantErrors)) {
      try {
        garantAddressFileKey = await upload(loanApp.cosignerAddressVoucher, String(loanApp.id));
        updFile('cosignerAddressVoucher', loanApp.cosignerAddressVoucher, garantAddressFileKey, loanApp.id);
      } catch (error) {
        _.set(
          errors,
          'qiTechErrors.garantAddress',
          'Something went wrong sending Garant Address Voucher file to QiTech',
        );
      }
      try {
        garantRgFileKey = await upload(loanApp.cosignerRg, String(loanApp.id));
        updFile('garantRg', loanApp.cosignerRg, garantRgFileKey, loanApp.id);
      } catch (error) {
        _.set(errors, 'qiTechErrors.garantAddress', 'Something went wrong sending Garant RG file to QiTech');
      }
      if (!garantRgFileKey) {
        _.set(errors, 'qiTechErrors.nullFileKey', 'QiTech returned a null key in garant RG file');
      }
      if (!garantAddressFileKey) {
        _.set(errors, 'qiTechErrors.nullFileKey', 'QiTech returned a null key in garant Residence Certificate file');
      }
    }
  } // Need to add rg file for each garant.

  deleteKeyIfNull<Partial<LoanAppErrors>>({ entity: errors });

  return errors;
}

// Payload Maker
export async function prepareQitechDebtPayload(loanApp: LoanApplicationDTO) {
  let spouse, bParsedPhone;

  let guarantors: any = [];

  const dealer: any = await Account.findByPk(loanApp.user?.accountId).catch(error => {
    throw error;
  });

  if (loanApp.person?.buyer) {
    bParsedPhone = phoneParser(loanApp.person.buyer?.cellPhone || loanApp.person.buyer?.homePhone);
  }

  if (loanApp.person?.couple) {
    const cParsedPhone = phoneParser(loanApp.person.couple.homePhone || loanApp.person.couple.cellPhone);

    const cpfCouple = loanApp.person.couple.citizenNumber ?? '';

    spouse = {
      person_type: 'natural',
      name: fullName(loanApp.person.couple),
      mother_name: loanApp.person.couple.mothersName,
      birth_date: loanApp.person.couple.birthDate,
      profession: loanApp.person.couple.profession,
      nationality: loanApp.person.couple.birthCountry,
      marital_status: loanApp.person.couple.civilStatus,
      wedding_certificate: loanApp.auxiliarDocument1.qit_key,
      is_pep: loanApp.person.couple.isPep,
      individual_document_number: cpf.strip(cpfCouple, true),
      document_identification: loanApp.auxiliarDocument2.qitKey,
      document_identification_number: loanApp.person.couple.rg,
      email: loanApp.person.couple.personalEmail || loanApp.person.couple.professionalEmail,
      phone: {
        country_code: cParsedPhone.country.padStart(3, '0'),
        area_code: cParsedPhone.area,
        number: cParsedPhone.phone,
      },
      address: {
        street: loanApp.person.couple.homeAddress,
        state: loanApp.person.couple.homeState,
        city: loanApp.person.couple.homeCity,
        neighborhood: loanApp.person.couple.homeNeighbour,
        number: String(loanApp.person.couple.homeAddressNumber),
        postal_code: loanApp.person.couple.homeCep,
        complement: loanApp.person.couple.homeComments,
      },
    };
  }

  if (loanApp.person?.garant) {
    const gParsedPhone = phoneParser(loanApp.person.garant.cellPhone);

    const cpfGarant = loanApp.person.garant.citizenNumber ?? '';
    const rgGarant = loanApp.person.garant.rg ?? '';

    guarantors = [
      {
        person_type: 'natural',
        name: fullName(loanApp.person.garant),
        mother_name: loanApp.person.garant.mothersName,
        birth_date: loanApp.person.garant.birthDate,
        profession: loanApp.person.garant.profession,
        nationality: loanApp.person.garant.birthCountry,
        marital_status: loanApp.person.garant.civilStatus,
        is_pep: loanApp.person.garant.isPep,
        individual_document_number: cpf.strip(cpfGarant, true),
        document_identification: JSON.parse(rgGarant).qit_key,
        document_identification_number: loanApp.person.garant.rg,
        email: loanApp.person.garant.personalEmail || loanApp.person.garant.professionalEmail,
        phone: {
          country_code: gParsedPhone.country.padStart(3, '0'),
          area_code: gParsedPhone.area,
          number: gParsedPhone.phone,
        },
        address: {
          street: loanApp.person.garant.homeAddress,
          state: loanApp.person.garant.homeState,
          city: loanApp.person.garant.homeCity,
          neighborhood: loanApp.person.garant.homeNeighbour,
          number: String(loanApp.person.garant.homeAddressNumber),
          postal_code: loanApp.person.garant.homeCep,
          complement: loanApp.person.garant.homeComments,
        },
        proof_of_residence: loanApp.cosignerAddressVoucher.qit_key,
      },
    ];
  }

  const payload: any = {
    borrower: {
      person_type: 'natural',
      name: fullName(loanApp.person?.buyer),
      mother_name: loanApp.person?.buyer?.mothersName,
      birth_date: loanApp.person?.buyer?.birthDate,
      profession: loanApp.person?.buyer?.profession,
      nationality: loanApp.person?.buyer?.birthCountry,
      marital_status: loanApp.person?.buyer?.civilStatus,
      spouse: !!loanApp.person?.couple ? spouse : null,
      wedding_certificate: loanApp.auxiliarDocument1 ? loanApp.auxiliarDocument1.qit_key : null,
      is_pep: loanApp.person?.buyer?.isPep,
      individual_document_number: cpf.strip(loanApp.person?.buyer?.citizenNumber || '0', true),
      document_identification: loanApp.rg.qit_key,
      document_identification_number: loanApp.person?.buyer?.rg,
      email: loanApp.person?.buyer?.personalEmail || loanApp.person?.buyer?.professionalEmail,
      phone: {
        country_code: bParsedPhone?.country.padStart(3, '0'),
        area_code: bParsedPhone?.area,
        number: bParsedPhone?.phone,
      },
      address: {
        street: loanApp.person?.buyer?.homeAddress,
        state: loanApp.person?.buyer?.homeState,
        city: loanApp.person?.buyer?.homeCity,
        neighborhood: loanApp.person?.buyer?.homeNeighbour,
        number: String(loanApp.person?.buyer?.homeAddressNumber),
        postal_code: loanApp.person?.buyer?.homeCep,
      },
      proof_of_residence: loanApp.addressVoucher.qit_key,
    },
    // this hardcoded number must be provided by bussiness
    purchaser_document_number: '32402502000135', // "16928337000101" test,
    guarantors: guarantors,
    disbursement_bank_accounts: [
      {
        bank_code: String(dealer.bankNumber),
        branch_number: String(dealer.bankAgencyNumber),
        account_number: String(dealer.bankAccountNumber),
        document_number: String(cnpj.strip(dealer.companyIDNumber, true)),
        account_digit: String(dealer.bankDigit),
        name: dealer.legalName,
        percentage_receivable: 100,
      },
    ],
    financial: {
      disbursed_amount: loanApp.offer?.calcs.disbursed_issue_amount,
      // cdi_percentage: 100,
      disbursement_start_date: nextBizDayByCountry(DateTime.now().toJSDate(), 'BR'),
      disbursement_end_date: nextBizDayByCountry(DateTime.now().plus({ days: 7 }).toJSDate(), 'BR'),
      credit_operation_type: loanApp.offer?.calcs.credit_operation_type,
      issue_date: nextBizDayByCountry(DateTime.now().toJSDate(), 'BR'),
      interest_type: loanApp.offer?.calcs.interest_type,
      fine_configuration: {
        contract_fine_rate: 0.02,
        interest_base: loanApp.offer?.calcs.prefixed_interest_rate.interest_base.replace('_365', ''), //QI simulation response is calendar_days_365, QI application request does not accept calendar_days_365, only calendar_days
        monthly_rate: loanApp.offer?.calcs.prefixed_interest_rate.monthly_rate,
      },
      interest_grace_period: loanApp.offer?.calcs.interest_grace_period,
      number_of_installments: loanApp.offer?.calcs.number_of_installments,
      principal_grace_period: loanApp.offer?.calcs.principal_grace_period || 0,
      annual_interest_rate: loanApp.offer?.calcs.prefixed_interest_rate.annual_rate,
      rebates: parsedRebates(loanApp.offer?.calcs.external_contract_fees),
    },
    additional_data: {
      vehicles: [
        {
          chassi: loanApp.inventory?.vin,
          owner: {
            document_number: loanApp.person?.buyer?.citizenNumber,
            name: fullName(loanApp.person?.buyer),
          },
          chassi_type: loanApp.inventory?.vinType || 'Normal', // (Normal || Remarcado) (normal or modified)
          model_year: loanApp.inventory?.year || loanApp.inventory?.vehicleYear,
          manufacture_year: loanApp.inventory?.assemblyYear,
          restriction_type: '03', // (01 - arrendamento mercantil, 02 - reserva de domínio/outros, 03 - alienação fiduciária, 09 - Penhor),
          renavam: loanApp.inventory?.registrationNumber,
          odometer_km: loanApp.inventory?.mileage,
          license_plate: loanApp.inventory?.licensePlate,
          crv_document_key: loanApp.vehicleRegistryCertificate ? loanApp.vehicleRegistryCertificate.qit_key : '',
          model_name: loanApp.inventory?.vehicleModelName,
          model_branch: loanApp.inventory?.vehicleBrandName,
          vehicle_value: String(
            formatNumber({
              integerSeparator: '.',
              padRight: 2,
              round: 2,
              decimal: ',',
            })(loanApp.inventory?.saleValuation || 0),
          ),
          color: loanApp.inventory?.color,
          // Unused at this time
          // licensing_uf: "SP",
          // licensing_city: "São paulo",
          // license_plate_uf: "SP",
          // license_plate_city: "São paulo",
          // has_fine_indicative: true,
        },
      ],
      vendor: {
        name: dealer.legalName,
        document_number: String(cnpj.strip(dealer.companyIDNumber, true)),
        email: dealer.email,
        street: dealer.address,
        street_number: String(dealer.streetNumber),
        neighborhood: dealer.neighborhood,
        city: dealer.city,
        state: dealer.state,
        postal_code: String(dealer.postalCode),
        account: String(dealer.bankAccountNumber),
        account_digit: String(dealer.bankDigit),
        branch: String(dealer.bankAgencyNumber),
        bank_code: String(dealer.bankNumber),
      },
    },
  };

  return payload;
}
