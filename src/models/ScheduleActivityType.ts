import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { ScheduleActivity } from './ScheduleActivity';

@Table({
  tableName: 'scheduleActivityTypes',
  timestamps: true,
})
export class ScheduleActivityType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => ScheduleActivity)
  activities: ScheduleActivity[] = [];
}
