import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'loanApplicationProviderLog',
  timestamps: true,
})
export class LoanApplicationProviderLog extends Model {
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationId!: number;

  @Column({
    type: DataType.STRING(20),
  })
  type!: string;

  @Column({
    type: DataType.STRING(200),
  })
  url!: string;

  @Column({
    type: DataType.STRING(10),
  })
  method!: string;

  @Column({
    type: DataType.JSON,
  })
  requestData!: any;

  @Column({
    type: DataType.INTEGER,
  })
  responseStatus!: number;

  @Column({
    type: DataType.JSON,
  })
  responseData!: any;
}
