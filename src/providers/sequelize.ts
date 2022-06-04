import { Sequelize } from 'sequelize-typescript';
import settings from '../settings';

const { mysql, debugModeSql } = settings;

import { Customer } from '../models/Customer';
import { Account } from '../models/Account';
import { ApplicationInstance } from '../models/ApplicationInstance';
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
import { AccountGroupRole } from '../models/AccountGroupRole';
import { Track } from '../models/Track';
import { Tracker } from '../models/Tracker';
import { TrackerActivity } from '../models/TrackerActivity';
import { TrackerActivityType } from '../models/TrackerActivityType';
import { TrackerLocation } from '../models/TrackerLocation';

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
    CustomerFulfillment,
    CustomerFulfillmentStatus,
    Profile,
    Variable,
    Location,
    Parameter,
    ProfileCapability,
    AccountGroup,
    AccountGroupPermission,
    AccountGroupRole,
    Client,
    Track,
    Tracker,
    TrackerActivity,
    TrackerActivityType,
    TrackerLocation,
  ],
});
