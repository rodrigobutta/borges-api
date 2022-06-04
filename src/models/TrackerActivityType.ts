import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { TrackerActivity } from './TrackerActivity';

@Table({
  tableName: 'trackerActivityType',
  timestamps: false,
})
export class TrackerActivityType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  locked!: boolean;

  @HasMany(() => TrackerActivity)
  trackerActivity: TrackerActivity[] = [];
}
