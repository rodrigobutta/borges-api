import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';

@Table({
  tableName: 'locations',
  timestamps: true,
})
export class Location extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  name!: string;

  @Column({
    type: DataType.STRING(255), // TODO get rid of this 255 of the old database model!!!!
  })
  address!: string;

  @Column({
    type: DataType.STRING(255),
  })
  streetName!: string;

  @Column({
    type: DataType.STRING(255),
  })
  streetNumber!: string;

  @Column({
    type: DataType.STRING(255),
  })
  additionalData!: string;

  @Column({
    type: DataType.STRING(255),
  })
  zipCode!: string;

  @Column({
    type: DataType.STRING(255), // TODO get rid of this 255 of the old database model!!!!
  })
  state!: string;

  @Column({
    type: DataType.STRING(255), // TODO get rid of this 255 of the old database model!!!!
  })
  city!: string;

  @Column({
    type: DataType.STRING(255), // TODO get rid of this 255 of the old database model!!!!
  })
  lat!: string;

  @Column({
    type: DataType.STRING(255), // TODO get rid of this 255 of the old database model!!!!
  })
  lng!: string;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  isPointOfSale!: boolean;

  @BelongsTo(() => Account, {
    foreignKey: 'accountId',
    targetKey: 'id',
  })
  account: Account = new Account();
}
