import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Account } from './Account';
import { AccountGroupPermission } from './AccountGroupPermission';
import { AccountGroupRole } from './AccountGroupRole';

@Table({
  tableName: 'accountGroup',
  timestamps: true,
})
export class AccountGroup extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.STRING(80),
  })
  keycloakId!: string;

  @HasMany(() => Account)
  accounts: Account[] = [];

  @HasMany(() => AccountGroupRole)
  roles: AccountGroupRole[] = [];

  @HasMany(() => AccountGroupPermission)
  permissions: AccountGroupPermission[] = [];
}
