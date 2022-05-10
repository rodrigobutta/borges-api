import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Account } from './Account';
import { Lead } from './Lead';
import { ScheduleType } from './ScheduleType';
import { Profile } from './Profile';
import { Inventory } from './Inventory';
import { Customer } from './Customer';
import { LoanApplication } from './LoanApplication';
import { ScheduleStatus } from './ScheduleStatus';
import { Location } from './Location';
import { Quote } from './Quote';

@Table({
  tableName: 'schedule',
  timestamps: true,
})
export class Schedule extends Model {
  @ForeignKey(() => ScheduleType)
  @Column({
    type: DataType.INTEGER,
  })
  scheduleTypeId!: number;

  @ForeignKey(() => ScheduleStatus)
  @Column({
    type: DataType.INTEGER,
  })
  scheduleStatusId!: number;

  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.INTEGER,
  })
  originScheduleId!: number;

  @Column({
    type: DataType.DATE,
  })
  when!: Date;

  @Column({
    type: DataType.STRING,
  })
  description!: string;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
  })
  quoteId!: number;

  @ForeignKey(() => LoanApplication)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationId!: number;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.INTEGER,
  })
  locationId!: number;

  // TODO dates

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @BelongsTo(() => Lead, {
    foreignKey: 'leadId',
    targetKey: 'id',
  })
  lead: Lead = new Lead();

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Customer)
  customer: Customer = new Customer();

  @BelongsTo(() => Inventory)
  inventory: Inventory = new Inventory();

  @BelongsTo(() => Quote)
  quote: Quote = new Quote();

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => ScheduleType)
  type: ScheduleType = new ScheduleType();

  @BelongsTo(() => ScheduleStatus)
  status: ScheduleStatus = new ScheduleStatus();
}
