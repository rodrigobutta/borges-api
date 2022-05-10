import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { AccountGroup } from './AccountGroup';

@Table({
  tableName: 'accounts',
  timestamps: true,
})
export class Account extends Model {
  @ForeignKey(() => AccountGroup)
  @Column({
    type: DataType.INTEGER,
  })
  accountGroupId!: number;

  @Column({
    type: DataType.STRING,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
  })
  legalName!: string;

  @Column({
    type: DataType.STRING,
  })
  companyIDNumber!: string;

  @Column({
    type: DataType.STRING,
  })
  address!: string;

  @Column({
    type: DataType.STRING,
  })
  city!: string;

  @Column({
    type: DataType.STRING,
  })
  state!: string;

  @Column({
    type: DataType.STRING,
  })
  comment!: string;

  @Column({
    type: DataType.STRING,
  })
  bankName!: string;

  @Column({
    type: DataType.STRING,
  })
  bankNumber!: string;

  @Column({
    type: DataType.STRING,
  })
  bankAccountNumber!: string;

  @Column({
    type: DataType.STRING,
  })
  bankAccountType!: string;

  @Column({
    type: DataType.STRING,
  })
  bankAgencyNumber!: string;

  @Column({
    type: DataType.STRING,
  })
  bankDigit!: string;

  @Column({
    type: DataType.INTEGER,
  })
  representative1!: number;

  @Column({
    type: DataType.INTEGER,
  })
  representative2!: number;

  @Column({
    type: DataType.INTEGER,
  })
  depositary!: number;

  @Column({
    type: DataType.STRING,
  })
  contactEmail!: string;

  @Column({
    type: DataType.STRING,
  })
  contactPhone!: string;

  @Column({
    type: DataType.INTEGER,
  })
  mlSellerId!: any;

  @Column({
    type: DataType.INTEGER,
  })
  postalCode!: any;

  @Column({
    type: DataType.STRING,
  })
  email!: any;

  @Column({
    type: DataType.NUMBER,
  })
  streetNumber!: any;

  @Column({
    type: DataType.STRING,
  })
  neighborhood!: any;

  @Column({
    type: DataType.JSON,
  })
  financialProviders!: any;

  @Column({
    type: DataType.STRING,
  })
  salesPersonBorges!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  infoComplete!: boolean;

  @BelongsTo(() => AccountGroup)
  accountGroup: AccountGroup = new AccountGroup();
}
