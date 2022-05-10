import { Model, Table, Column, ForeignKey, BelongsTo, DataType, HasMany } from 'sequelize-typescript';
import { Account } from './Account';
import { LoanApplication } from './LoanApplication';

import { Customer } from './Customer';
import { LeadActivity } from './LeadActivity';
import { LeadStatus } from './LeadStatus';
import { Quote } from './Quote';
import { Profile } from './Profile';

@Table({
  tableName: 'leads',
  timestamps: true,
})
export class Lead extends Model {
  @Column({
    type: DataType.STRING,
  })
  origin!: string;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @Column({
    type: DataType.DATE,
  })
  lastInteractionAt!: Date;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  lastInteractionUserId!: number;

  @Column({
    type: DataType.STRING,
  })
  lastInteractionOrigin!: string;

  @ForeignKey(() => LeadStatus)
  @Column({
    type: DataType.INTEGER,
  })
  leadStatusId!: number;

  @HasMany(() => LeadActivity)
  activity: LeadActivity[] = [];

  @HasMany(() => Quote)
  quotes: Quote[] = [];

  @HasMany(() => LoanApplication)
  loanApplications: LoanApplication[] = [];

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Profile, {
    foreignKey: 'userId',
    targetKey: 'id',
  })
  firstInteractionUser: Profile = new Profile();

  @BelongsTo(() => Profile, {
    foreignKey: 'lastInteractionUserId',
    targetKey: 'id',
  })
  lastInteractionUser: Profile = new Profile();

  @BelongsTo(() => Customer)
  customer: Customer = new Customer();

  @BelongsTo(() => LeadStatus)
  status: LeadStatus = new LeadStatus();
}
