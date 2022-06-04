import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'trackerLocation',
  timestamps: true,
})
export class TrackerLocation extends Model {
  @Column({
    type: DataType.DECIMAL(10, 8),
  })
  lat!: number;

  @Column({
    type: DataType.DECIMAL(10, 8),
  })
  lng!: number;

  @Column({
    type: DataType.STRING,
  })
  trackerId!: string;
}
