import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { Quote } from './Quote';

@Table({
  tableName: 'offers',
  timestamps: true,
  indexes: [
    {
      fields: ['consumerLoanRequestId'],
    },
  ],
})
export class Offer extends Model {
  @Column({
    type: DataType.INTEGER,
  })
  term!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  installmentAmount!: number;

  @Column({
    type: DataType.JSON,
  })
  calcs!: any;

  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
  })
  consumerLoanRequestId!: number;
}
