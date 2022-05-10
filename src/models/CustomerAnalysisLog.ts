import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Customer } from './Customer';

@Table({
  tableName: 'customerAnalysisLogs',
  timestamps: true,
  indexes: [
    {
      fields: ['reference'],
    },
  ],
})
export class CustomerAnalysisLog extends Model {
  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @Column({
    type: DataType.STRING,
  })
  reference!: string;

  @Column({
    type: DataType.STRING,
  })
  provider!: string;

  @Column({
    type: DataType.JSON,
  })
  request!: any;

  @Column({
    type: DataType.JSON,
  })
  response!: any;

  @BelongsTo(() => Customer, {
    foreignKey: 'customerId',
    targetKey: 'id',
  })
  customer: Customer = new Customer();
}
