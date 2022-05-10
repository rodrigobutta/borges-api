import { Sequelize } from 'sequelize-typescript';
import settings from '../settings';

const { mysql, debugModeSql } = settings;

import { Lead } from '../models/Lead';
import { Customer } from '../models/Customer';
import { Account } from '../models/Account';
import { ApplicationInstance } from '../models/ApplicationInstance';
import { CustomerAnalysis } from '../models/CustomerAnalysis';
import { CustomerAnalysisLog } from '../models/CustomerAnalysisLog';
import { LeadActivity } from '../models/LeadActivity';
import { LeadActivityType } from '../models/LeadActivityType';
import { Quote } from '../models/Quote';
import { QuoteStatus } from '../models/QuoteStatus';
import { QuoteStatusReason } from '../models/QuoteStatusReason';
import { QuoteActivity } from '../models/QuoteActivity';
import { QuoteAnalysisLog } from '../models/QuoteAnalysisLog';
import { Profile } from '../models/Profile';
import { Inventory } from '../models/Inventory';
import { Variable } from '../models/Variable';
import { CurrencyExchange } from '../models/CurrencyExchange';
import { Offer } from '../models/Offer';
import { CustomerFulfillment } from '../models/CustomerFulfillment';
import { CustomerFulfillmentStatus } from '../models/CustomerFulfillmentStatus';
import { InventoryFile } from '../models/InventoryFile';
import { InventoryType } from '../models/InventoryType';
import { InventoryComment } from '../models/InventoryComment';
import { LeadStatus } from '../models/LeadStatus';
import { InventoryStatus } from '../models/InventoryStatus';
import { InventoryActivity } from '../models/InventoryActivity';
import { InventoryActivityType } from '../models/InventoryActivityType';
import { InventoryRevisions } from '../models/InventoryRevisions';
import { Color } from '../models/Color';
import { Location } from '../models/Location';
import { LoanApplication } from '../models/LoanApplication';
import { LoanApplicationRevision } from '../models/LoanApplicationRevision';
import { Status } from '../models/Status';
import { Schedule } from '../models/Schedule';
import { ScheduleActivity } from '../models/ScheduleActivity';
import { ScheduleActivityType } from '../models/ScheduleActivityType';
import { ScheduleStatus } from '../models/ScheduleStatus';
import { ScheduleType } from '../models/ScheduleType';
import { Onboard } from '../models/Onboard';
import { VehicleGeneralConditions } from '../models/VehicleGeneralConditions';
import { Parameter } from '../models/Parameter';
import { Person } from '../models/Person';
import { ProfileCapability } from '../models/ProfileCapability';
import { AccountGroup } from '../models/AccountGroup';
import { AccountGroupPermission } from '../models/AccountGroupPermission';
import { InventorySnapshot } from '../models/InventorySnapshot';
import { AccountGroupRole } from '../models/AccountGroupRole';
import { AccountFiles } from '../models/AccountFiles';
import { LoanApplicationActivity } from '../models/LoanApplicationActivity';
import { LeadComment } from '../models/LeadComment';
import { StateGravamen } from '../models/StateGravamen';
import { Bank } from '../models/Bank';
import { Document } from '../models/Document';
import { DocumentSignature } from '../models/DocumentSignature';
import { LoanApplicationProviderLog } from '../models/LoanApplicationProviderLog';
import { Sales } from '../models/Sales';
import { SalePayMethod } from '../models/SalePayMethod';
import { OnBoardingLead } from '../models/OnBoardingLead';
import { OnBoarding } from '../models/OnBoarding';
import { FloorPlanQuote } from '../models/FloorPlanQuote';
import { Fipe } from '../models/Fipe';
import { Audit } from '../models/Audit';
import { OfferLogRequest } from '../models/OfferLogRequest';
import { LoanApplicationStatus } from '../models/LoanApplicationStatus';
import { LoanApplicationStatusReason } from '../models/LoanApplicationStatusReason';
import { Client } from '../models/Client';
import { DealerCommission } from '../models/DealerCommission';
import { DealerCommissionTable } from '../models/DealerCommissionTable';
import { DealerCommissionTableAssignment } from '../models/DealerCommissionTableAssignment';

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
    AccountGroup,
    AccountGroupPermission,
    AccountGroupRole,
    AccountFiles,
    ApplicationInstance,
    Customer,
    CustomerAnalysis,
    CustomerFulfillment,
    CustomerFulfillmentStatus,
    CustomerAnalysisLog,
    Lead,
    LeadActivity,
    LeadActivityType,
    Quote,
    QuoteStatus,
    QuoteStatusReason,
    QuoteActivity,
    QuoteAnalysisLog,
    Profile,
    Inventory,
    InventoryComment,
    InventoryType,
    InventoryStatus,
    InventoryActivity,
    InventoryActivityType,
    InventoryRevisions,
    Variable,
    CurrencyExchange,
    Offer,
    InventoryFile,
    Color,
    LeadStatus,
    Location,
    Status,
    Schedule,
    ScheduleType,
    ScheduleActivity,
    ScheduleActivityType,
    ScheduleStatus,
    Onboard,
    VehicleGeneralConditions,
    Parameter,
    Person,
    ProfileCapability,
    InventorySnapshot,
    LeadComment,
    StateGravamen,
    Bank,
    Document,
    DocumentSignature,
    OfferLogRequest,
    Audit,
    Fipe,
    FloorPlanQuote,
    OnBoarding,
    OnBoardingLead,
    SalePayMethod,
    Sales,
    DealerCommission,
    DealerCommissionTable,
    DealerCommissionTableAssignment,
    LoanApplication,
    LoanApplicationRevision,
    LoanApplicationProviderLog,
    LoanApplicationActivity,
    LoanApplicationStatus,
    LoanApplicationStatusReason,
    Client,
  ],
});
