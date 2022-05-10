import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { LoanApplication } from './LoanApplication';

LoanApplication;
@Table({
  tableName: 'loanApplicationStatusReason',
  timestamps: true,
})
export class LoanApplicationStatusReason extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.JSON,
  })
  description!: string;

  @HasMany(() => LoanApplication)
  quotes: LoanApplication[] = [];
}
