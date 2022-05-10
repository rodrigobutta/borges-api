import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Inventory } from './Inventory';

@Table({
  tableName: 'audits',
  timestamps: true,
})
export class Audit extends Model {
  @Column({
    type: DataType.STRING(20),
  })
  licensePlate!: string;

  @Column({
    type: DataType.STRING(20),
  })
  makerCountry!: string;

  @Column({
    type: DataType.SMALLINT,
  })
  year!: number;

  @Column({
    type: DataType.INTEGER,
  })
  mileage!: number;

  @Column({
    type: DataType.INTEGER,
  })
  fipeValuation!: number;

  @Column({
    type: DataType.STRING(100),
  })
  result!: string;

  @Column({
    type: DataType.STRING,
  })
  rejectReason!: string;

  @Column({
    type: DataType.STRING(100),
  })
  brand!: string;

  @Column({
    type: DataType.STRING(100),
  })
  color!: string;

  @Column({
    type: DataType.STRING(100),
  })
  model!: string;

  @Column({
    type: DataType.STRING(100),
  })
  type!: string;

  @Column({
    type: DataType.STRING(20),
  })
  vin!: string;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @BelongsTo(() => Inventory, {
    onDelete: 'CASCADE',
  })
  inventory: Inventory = new Inventory();
}
