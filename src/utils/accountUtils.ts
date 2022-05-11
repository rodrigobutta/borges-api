import { ACCOUNT_FILTERS } from '../constants';
import { Filter } from '../dto/Filter';
import { Sequelize, WhereOptions } from 'sequelize';
import { addCondition } from './filterUtils';
import { Request } from 'express';
import * as EmailValidator from 'email-validator';
import { concat } from 'lodash';
import { Account } from '../models/Account';

export function getWhereAccount(filters: any) {
  let where: WhereOptions = {};
  let conditions: Map<string, any> = new Map();

  if (filters) {
    ACCOUNT_FILTERS.forEach((f: Filter) => {
      addCondition(conditions, filters, f);
    });
  }

  where = Sequelize.and(Object.fromEntries(conditions));

  return where;
}

export function validationResult(req: Request): boolean {
  let valid = true;
  const { email, firstName, lastName } = req.body;
  valid =
    valid && EmailValidator.validate(email) && firstName.match(/^[A-Za-z \.]+$/) && lastName.match(/^[A-Za-z \.]+$/);

  return valid;
}

export async function getTemplateInvitationMail() {
  return (
    '<!doctype html>\n <html>\n    <head>\n      <title> {{title}}' +
    '</title>\n    </head>\n    <body>\n      <div id="app">' +
    "<table style='width: 100%; text-align:center;'>" +
    '<tbody>' +
    '<tr>' +
    '<td> <header style=\'align: "center"\'></header>' +
    '<img src="cid:BorgesLogo.jpg">' +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td> <h3 style=\'align: "center"\'>Obrigado/a {{firstname}}</h3>' +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td style=\'align: "center"\'>' +
    'Clique no link abaixo para redefinir sua senha' +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td style=\'align: "center"\'> <a style=\'color: "#fff", background: "#2c3357", borderColor: "#2c3357", textShadow: "0 - 1px 0 rgba(0, 0, 0, 0.12)", boxShadow: "0 2px 0 rgba(0, 0, 0, 0.045)", width: "200px", padding: "8px 15px", borderRadius: "5px", textDecoration: "none"\'' +
    "href='{{url}}'>{{label}} </a>" +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td style=\'align: "center"\'>' +
    concat('\xA9 Copyright ', new Date().getFullYear().toString(), ' | borges.com') +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>\n    </body>\n  </html>\n'
  );
}

const requiredFields = [
  'address',
  'bankAccountNumber',
  'bankAgencyNumber',
  'bankDigit',
  'bankName',
  'bankNumber',
  'city',
  'companyIDNumber',
  'email',
  'neighborhood',
  'postalCode',
  'state',
  'streetNumber',
  'representative1',
  'representative2',
  'depositary',
];

export function requiredFieldsCompleted(account: Account) {
  let uncompletedFields: string[] = [];
  let allFieldsCompleted = true;
  let auxValue = undefined;
  requiredFields.forEach(field => {
    auxValue = account[field as keyof Account];
    if (!auxValue) {
      allFieldsCompleted = false;
      uncompletedFields.push(field);
    }
  });
  return { hasError: !allFieldsCompleted, uncompletedFields };
}
