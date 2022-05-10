import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';
import { DealerCommissionTable } from './DealerCommissionTable';

@Table({
  tableName: 'dealerCommissionTableAssignment',
  timestamps: true,
  indexes: [
    {
      name: 'unique_score_account',
      unique: true,
      fields: ['customerAnalysisScore', 'accountId'],
    },
    {
      fields: ['accountId'],
    },
  ],
})
export class DealerCommissionTableAssignment extends Model {
  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @Column({
    type: DataType.STRING,
  })
  customerAnalysisScore!: string;

  @ForeignKey(() => DealerCommissionTable)
  @Column({
    type: DataType.INTEGER,
  })
  dealerCommissionTableId!: number;

  @BelongsTo(() => DealerCommissionTable)
  dealerCommissionTable: DealerCommissionTable = new DealerCommissionTable();

  @BelongsTo(() => Account)
  account: Account = new Account();
}
