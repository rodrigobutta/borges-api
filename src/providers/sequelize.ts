import { Sequelize } from 'sequelize-typescript';
import settings from '../settings';

const { mysql, debugModeSql } = settings;

import { Customer } from '../models/Customer';
import { Account } from '../models/Account';
import { ApplicationInstance } from '../models/ApplicationInstance';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { CustomerAnalysisLog } from '../models/CustomerAnalysisLog';
import { Profile } from '../models/Profile';
import { Variable } from '../models/Variable';
import { CustomerFulfillment } from '../models/CustomerFulfillment';
import { CustomerFulfillmentStatus } from '../models/CustomerFulfillmentStatus';
// import { Application } from '../models/Application';
import { Location } from '../models/Location';
import { Parameter } from '../models/Parameter';
import { ProfileCapability } from '../models/ProfileCapability';
import { AccountGroup } from '../models/AccountGroup';
import { AccountGroupPermission } from '../models/AccountGroupPermission';
import { Client } from '../models/Client';

export const sequelize = new Sequelize(mysql.NAME, mysql.USERNAME, mysql.PASSWORD, {
  host: mysql.HOST,
  port: mysql.PORT,
  dialect: 'mysql',
  dialectOptions: {
    decimalNumbers: true,
  },
  logging: debugModeSql == 1 ? str => console.log(str) : false,

  models: [
    Account,
    ApplicationInstance,
    Customer,
    CustomerAnalysis,
    CustomerFulfillment,
    CustomerFulfillmentStatus,
    CustomerAnalysisLog,
    Profile,
    Variable,
    Location,
    Parameter,
    ProfileCapability,
    AccountGroup,
    AccountGroupPermission,
    Client,
  ],
});
