import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Account } from './Account';
import { Lead } from './Lead';
import { ScheduleActivityType } from './ScheduleActivityType';
import { Profile } from './Profile';
import { Schedule } from './Schedule';

@Table({
  tableName: 'scheduleActivity',
  timestamps: true,
})
export class ScheduleActivity extends Model {
  @ForeignKey(() => Schedule)
  @Column({
    type: DataType.INTEGER,
  })
  scheduleId!: number;

  @ForeignKey(() => ScheduleActivityType)
  @Column({
    type: DataType.INTEGER,
  })
  scheduleActivityTypeId!: number;

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
    type: DataType.TEXT,
  })
  text!: string;

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

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => ScheduleActivityType)
  activityType: ScheduleActivityType = new ScheduleActivityType();
}
