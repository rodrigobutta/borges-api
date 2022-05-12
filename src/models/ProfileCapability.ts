import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';
import { AccountGroupPermission } from './AccountGroupPermission';
import { Profile } from './Profile';

@Table({
  tableName: 'profileCapability',
  timestamps: true,
  indexes: [
    {
      name: 'unique_profile_account',
      unique: true,
      fields: ['profileId', 'accountId'],
    },
    {
      fields: ['profileId'],
    },
  ],
})
export class ProfileCapability extends Model {
  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  profileId!: string;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => AccountGroupPermission)
  @Column({
    type: DataType.INTEGER,
  })
  accountGroupPermissionId!: number;

  @BelongsTo(() => Profile)
  profile: Profile = new Profile();

  @BelongsTo(() => AccountGroupPermission)
  accountGroupPermission: AccountGroupPermission = new AccountGroupPermission();

  @BelongsTo(() => Account)
  account: Account = new Account();
}
