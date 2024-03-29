import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { CustomerFulfillmentStatus } from './CustomerFulfillmentStatus';

const UNIQUE_CONSTRAINT_CUSTOMER_ACCOUNT: string = 'unique_lead_per_account';

@Table({
  tableName: 'customers',
  timestamps: true,
  indexes: [
    {
      name: UNIQUE_CONSTRAINT_CUSTOMER_ACCOUNT,
      unique: true,
      fields: ['customerId', 'accountId'],
    },
  ],
})
export class Customer extends Model {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  citizenNumber!: string; // ex cpf

  @Column({
    type: DataType.STRING,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
  })
  cnpj!: string;

  @Column({
    type: DataType.STRING,
    validate: {
      notEmpty: true,
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
  })
  phoneNumber!: string;

  @Column({
    type: DataType.STRING,
  })
  stateCode!: string;

  @Column({
    type: DataType.STRING,
  })
  jobType!: number;

  @Column({
    type: DataType.JSON,
  })
  idFrontImage!: any;

  @Column({
    type: DataType.JSON,
  })
  idBackImage!: any;

  @Column({
    type: DataType.JSON,
  })
  addressCertificate!: any;

  @Column({
    type: DataType.JSON,
  })
  incomeCertificate!: any;

  @Column({
    type: DataType.JSON,
  })
  auxiliaryDocument1!: any;

  @Column({
    type: DataType.JSON,
  })
  auxiliaryDocument2!: any;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  estimatedIncome!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declaredIncome!: number;

  @ForeignKey(() => CustomerFulfillmentStatus)
  @Column({
    type: DataType.INTEGER,
  })
  customerFulfillmentStatusId!: number;

  @BelongsTo(() => CustomerFulfillmentStatus)
  fulfillmentStatus: CustomerFulfillmentStatus = new CustomerFulfillmentStatus();
}
