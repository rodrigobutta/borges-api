import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Customer } from './Customer';
import { CustomerAnalysisLog } from './CustomerAnalysisLog';
import { Inventory } from './Inventory';
import { InventorySnapshot } from './InventorySnapshot';
import { Lead } from './Lead';
import { LoanApplication } from './LoanApplication';
import { Offer } from './Offer';
import { QuoteAnalysisLog } from './QuoteAnalysisLog';
import { QuoteStatus } from './QuoteStatus';
import { QuoteStatusReason } from './QuoteStatusReason';

import { Profile } from './Profile';

@Table({
  tableName: 'consumerLoanRequests',
  timestamps: true,
  indexes: [
    {
      fields: ['leadId'],
    },
  ],
})
export class Quote extends Model {
  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @Column({
    type: DataType.STRING,
  })
  reference!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  amount!: number;

  @Column({
    type: DataType.INTEGER,
  })
  dealerCommissionId!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  dealerCommissionPercentage!: number;

  @Column({
    type: DataType.STRING,
  })
  channel!: string;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => InventorySnapshot)
  @Column({
    type: DataType.INTEGER,
  })
  inventorySnapshotId!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  inventorySaleValuation!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  inventoryNew!: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  inventoryAge!: number;

  @Column({
    type: DataType.STRING,
  })
  gravamenStateCode!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  gravamenAmount!: number;

  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @Column({
    type: DataType.INTEGER,
  })
  jobTypeId!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declaredIncome!: number;

  @Column({
    type: DataType.INTEGER,
  })
  cosignerJobTypeId!: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  cosignerCustomerId!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  cosignerDeclaredIncome!: number;

  @Column({
    type: DataType.STRING(20),
  })
  customerAnalysisScore!: string;

  @Column({
    type: DataType.STRING(20),
  })
  customerAnalysisCode!: string;

  @Column({
    type: DataType.STRING(20),
  })
  customerAnalysisReason!: string;

  @Column({
    type: DataType.STRING(20),
  })
  customerAnalysisDecision!: string;

  @ForeignKey(() => CustomerAnalysisLog)
  @Column({
    type: DataType.INTEGER,
  })
  customerAnalysisLogId!: number;

  @Column({
    type: DataType.STRING(20),
  })
  cosignerAnalysisScore!: string;

  @Column({
    type: DataType.STRING(20),
  })
  cosignerAnalysisCode!: string;

  @Column({
    type: DataType.STRING(20),
  })
  cosignerAnalysisReason!: string;

  @Column({
    type: DataType.STRING(20),
  })
  cosignerAnalysisDecision!: string;

  @Column({
    type: DataType.STRING(20),
  })
  loanAnalysisCode!: string;

  @Column({
    type: DataType.STRING(20),
  })
  loanAnalysisReason!: string;

  @Column({
    type: DataType.STRING(20),
  })
  loanAnalysisDecision!: string;

  @Column({
    type: DataType.JSON,
  })
  loanAnalysisResult!: any;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  loanMaxAmount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  loanMaxInstallmentAmount!: number;

  @Column({
    type: DataType.JSON,
  })
  loans!: any;

  @Column({
    type: DataType.BOOLEAN,
  })
  loanIncludeExpenses!: boolean;

  @ForeignKey(() => QuoteAnalysisLog)
  @Column({
    type: DataType.INTEGER,
  })
  loanAnalysisLogId!: number;

  @ForeignKey(() => QuoteStatus)
  @Column({
    type: DataType.INTEGER,
  })
  quoteInstanceId!: number;

  @ForeignKey(() => QuoteStatusReason)
  @Column({
    type: DataType.INTEGER,
  })
  quoteStatusReasonId!: number;

  @Column({
    type: DataType.INTEGER,
  })
  interest!: number;

  @Column({
    type: DataType.DATE,
  })
  expirationDate!: Date;

  @BelongsTo(() => Lead)
  lead: Lead = new Lead();

  @BelongsTo(() => Customer)
  cosigner: Customer = new Customer();

  @BelongsTo(() => Inventory)
  inventory: Inventory = new Inventory();

  @BelongsTo(() => QuoteStatus)
  status: QuoteStatus = new QuoteStatus();

  @BelongsTo(() => QuoteStatusReason)
  quoteStatusReason: QuoteStatusReason = new QuoteStatusReason();

  @BelongsTo(() => CustomerAnalysisLog)
  customerAnalysisLog: CustomerAnalysisLog = new CustomerAnalysisLog();

  @BelongsTo(() => QuoteAnalysisLog)
  analysisLog: QuoteAnalysisLog = new QuoteAnalysisLog();

  @HasMany(() => Offer, 'consumerLoanRequestId')
  offers: Offer[] = [];

  @HasMany(() => LoanApplication, 'consumerLoanRequestId')
  loanApplications: LoanApplication[] = [];

  @BelongsTo(() => Profile)
  user: Profile = new Profile();
}
