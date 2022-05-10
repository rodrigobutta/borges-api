import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Sales } from './Sales';

@Table({
  tableName: 'salePayMethods',
  timestamps: true,
})
export class SalePayMethod extends Model {
  @Column({
    type: DataType.STRING(45),
  })
  key!: string;

  @Column({
    type: DataType.STRING(256),
  })
  value!: string;

  @ForeignKey(() => Sales)
  @Column({
    type: DataType.INTEGER,
  })
  saleId!: number;

  @BelongsTo(() => Sales, {
    onDelete: 'CASCADE',
  })
  sales: Sales = new Sales();
}
