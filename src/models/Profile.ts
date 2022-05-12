import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';
import { AccountGroupRole } from './AccountGroupRole';
import { Customer } from './Customer';

const UNIQUE_CONSTRAINT_USER_UUID_ACCOUNT: string = 'unique_user_uuid_account';

@Table({
  tableName: 'profile',
  timestamps: true,
  indexes: [
    {
      name: UNIQUE_CONSTRAINT_USER_UUID_ACCOUNT,
      unique: true,
      fields: ['uuid', 'accountId'],
    },
  ],
  paranoid: true,
})
export class Profile extends Model {
  // @Column({
  //   type: DataType.UUID,
  //   defaultValue: DataType.UUIDV4,
  //   primaryKey: true,
  // })
  // id!: string;

  @Column({
    type: DataType.STRING(40),
    unique: true,
  })
  uuid!: string;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => AccountGroupRole)
  @Column({
    type: DataType.INTEGER,
  })
  accountGroupRoleId!: number;

  @Column({
    type: DataType.STRING(120),
    unique: true,
  })
  email!: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @Column({
    type: DataType.STRING(80),
  })
  firstName!: string;

  @Column({
    type: DataType.STRING(80),
  })
  lastName!: string;

  @Column({
    type: DataType.STRING(80),
  })
  authClientName!: string;

  @Column({
    type: DataType.STRING(10),
  })
  locale!: string;

  @Column({
    type: DataType.DATE,
  })
  lastVisit!: Date;

  @BelongsTo(() => Customer)
  customer: Customer = new Customer();

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => AccountGroupRole)
  accountGroupRole: AccountGroupRole = new AccountGroupRole();

  // @BelongsToMany(() => AccountGroupPermission, () => ProfileCapability)
  // capability: AccountGroupPermission[] = [];

  // @HasMany(() => ProfileCapability, 'profileId')
  // capabilities: ProfileCapability[] = [];
}
