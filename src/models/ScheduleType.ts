import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Schedule } from './Schedule';

@Table({
  tableName: 'scheduleType',
  timestamps: true,
})
export class ScheduleType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => Schedule)
  schedules: Schedule[] = [];
}
