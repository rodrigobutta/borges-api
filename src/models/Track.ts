import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tracker } from './Tracker';

@Table({
  tableName: 'track',
  timestamps: true,
})
export class Track extends Model {
  @Column({
    type: DataType.DOUBLE(255, 8),
  })
  lat!: string;

  @Column({
    type: DataType.DOUBLE(255, 8),
  })
  lng!: string;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @ForeignKey(() => Tracker)
  @Column({
    type: DataType.INTEGER,
  })
  trackerId!: string;

  @BelongsTo(() => Tracker, {
    foreignKey: 'trackerId',
    targetKey: 'id',
  })
  account: Tracker = new Tracker();
}
