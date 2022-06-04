import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Tracker } from './Tracker';
import { TrackerActivityType } from './TrackerActivityType';

@Table({
  tableName: 'trackerActivity',
  timestamps: true,
})
export class TrackerActivity extends Model {
  @ForeignKey(() => Tracker)
  @Column({
    type: DataType.STRING,
  })
  trackerId!: string;

  @ForeignKey(() => TrackerActivityType)
  @Column({
    type: DataType.INTEGER,
  })
  trackerActivityTypeId!: number;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @BelongsTo(() => Tracker, {
    foreignKey: 'trackerId',
    targetKey: 'id',
  })
  tracker: Tracker = new Tracker();

  @BelongsTo(() => TrackerActivityType)
  trackerActivityType: TrackerActivityType = new TrackerActivityType();
}
