import { Model, Table, Column, ForeignKey, DataType } from 'sequelize-typescript';

import { Customer } from './Customer';

@Table({
  tableName: 'customerAnalyses',
  timestamps: true,
  indexes: [
    {
      fields: ['customerId'],
    },
  ],
})
export class CustomerAnalysis extends Model {
  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
    unique: true,
  })
  customerId!: number;

  @Column({
    type: DataType.STRING,
    // TODO not null
  })
  score!: string;

  @Column({
    type: DataType.STRING,
  })
  code!: string;

  @Column({
    type: DataType.STRING,
  })
  reason!: string;

  @Column({
    type: DataType.STRING,
  })
  decision!: string;

  @Column({
    type: DataType.JSON,
  })
  result!: any;

  @Column({
    type: DataType.INTEGER,
  })
  customerAnalysisLogId!: number;

  @Column({
    type: DataType.DATE,
  })
  requestedAt!: Date;
}
