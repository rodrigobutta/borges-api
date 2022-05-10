import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Account } from './Account';
import { Client } from './Client';
import { Lead } from './Lead';
import { LeadActivityType } from './LeadActivityType';
import { Profile } from './Profile';

@Table({
  tableName: 'leadActivities',
  timestamps: true,
})
export class LeadActivity extends Model {
  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @ForeignKey(() => LeadActivityType)
  @Column({
    type: DataType.INTEGER,
  })
  leadActivityTypeId!: number;

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

  @Column({
    type: DataType.STRING,
  })
  description!: string;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @ForeignKey(() => Client)
  @Column({
    type: DataType.INTEGER,
  })
  clientId!: number;

  @BelongsTo(() => Lead, {
    foreignKey: 'leadId',
    targetKey: 'id',
  })
  lead: Lead = new Lead();

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => LeadActivityType)
  activityType: LeadActivityType = new LeadActivityType();

  @BelongsTo(() => Client)
  client: Client = new Client();
}
