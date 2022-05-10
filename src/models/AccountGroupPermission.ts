import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { AccountGroup } from './AccountGroup';

@Table({
  tableName: 'accountGroupPermission',
  timestamps: true,
  indexes: [
    {
      fields: ['accountGroupId'],
    },
  ],
})
export class AccountGroupPermission extends Model {
  @ForeignKey(() => AccountGroup)
  @Column({
    type: DataType.INTEGER,
  })
  accountGroupId!: number;

  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @BelongsTo(() => AccountGroup)
  accountGroup: AccountGroup = new AccountGroup();
}
