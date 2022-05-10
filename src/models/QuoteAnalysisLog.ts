import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'consumerLoanRequestAnalysisLogs',
  timestamps: true,
  indexes: [
    {
      fields: ['reference'],
    },
  ],
})
export class QuoteAnalysisLog extends Model {
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
}
