import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Account } from './Account';
import { Profile } from './Profile';

@Table({
  // *old name: 'loanRequest'
  tableName: 'floorPlanQuotes',
  timestamps: true,
})
export class FloorPlanQuote extends Model {
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  amount!: number;

  @Column({
    type: DataType.STRING(30),
  })
  status!: string;

  @Column({
    type: DataType.STRING,
  })
  rejectReason!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  maxLTV!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  disbursedValue!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  maximumLoanAmount!: number;

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

  @BelongsTo(() => Account, {
    onDelete: 'CASCADE',
  })
  account!: Account;

  @BelongsTo(() => Profile, {
    onDelete: 'CASCADE',
  })
  user!: Profile;
}
