import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';

@Table({
  tableName: 'statuses',
  timestamps: true,
})
export class Status extends Model {
  @Column({
    type: DataType.STRING(29),
  })
  name!: string;

  @Column({
    type: DataType.STRING(10),
  })
  color!: string;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @BelongsTo(() => Account, {
    foreignKey: 'accountId',
    targetKey: 'id',
  })
  account: Account = new Account();
}
