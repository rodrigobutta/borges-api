import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ILoanApplicationActivityData } from '../lib/loanApplication';
import { Account } from './Account';
import { LoanApplication } from './LoanApplication';
import { LoanApplicationStatus } from './LoanApplicationStatus';
import { Profile } from './Profile';

@Table({
  tableName: 'loanApplicationActivity',
  timestamps: true,
})
export class LoanApplicationActivity extends Model {
  @ForeignKey(() => LoanApplication)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationId!: number;

  @ForeignKey(() => LoanApplicationStatus)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationStatusId!: number;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @Column({
    type: DataType.JSON,
  })
  data!: ILoanApplicationActivityData;

  @BelongsTo(() => LoanApplication, {
    foreignKey: 'loanApplicationId',
    targetKey: 'id',
  })
  loanApplication: LoanApplication = new LoanApplication();

  @BelongsTo(() => LoanApplicationStatus)
  loanApplicationStatus: LoanApplicationStatus = new LoanApplicationStatus();

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Profile)
  profile: Profile = new Profile();
}
