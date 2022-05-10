import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Inventory } from './Inventory';
import { Lead } from './Lead';
import { LoanApplicationRevision } from './LoanApplicationRevision';
import { Offer } from './Offer';
import { Person } from './Person';
import { Quote } from './Quote';
import { Profile } from './Profile';
import { LoanApplicationActivity } from './LoanApplicationActivity';
import { LoanApplicationStatus } from './LoanApplicationStatus';
import { LoanApplicationStatusReason } from './LoanApplicationStatusReason';

@Table({
  tableName: 'consumerLoanApplications',
  timestamps: true,
  indexes: [
    {
      fields: ['leadId'],
    },
    {
      fields: ['userId'],
    },
  ],
})
export class LoanApplication extends Model {
  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Offer)
  @Column({
    type: DataType.INTEGER,
  })
  offerId!: number;

  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
  })
  consumerLoanRequestId!: number;

  @ForeignKey(() => LoanApplicationStatus)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationStatusId!: number;

  @ForeignKey(() => LoanApplicationStatusReason)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationStatusReasonId!: number;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @Column({
    type: DataType.STRING,
  })
  status!: string;

  @Column({
    type: DataType.STRING,
  })
  company!: string;

  @Column({
    type: DataType.DATE,
  })
  expiresAt!: Date;

  @Column({
    type: DataType.STRING,
  })
  vehicleType!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleBrand!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleModel!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleModelYear!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleColor!: string;

  @Column({
    type: DataType.STRING,
  })
  vehiclePlate!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleYear!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleChasis!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleValue!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleDoors!: string;

  @Column({
    type: DataType.STRING,
  })
  vehicleRenavam!: string;

  @Column({
    type: DataType.JSON,
  })
  addressVoucher!: any;

  @Column({
    type: DataType.JSON,
  })
  rentVoucher!: any;

  @Column({
    type: DataType.JSON,
  })
  rg!: any;

  @Column({
    type: DataType.JSON,
  })
  cosignerAddressVoucher!: any;

  @Column({
    type: DataType.JSON,
  })
  cosignerRentVoucher!: any;

  @Column({
    type: DataType.JSON,
  })
  cosignerRg!: any;

  @Column({
    type: DataType.JSON,
  })
  auxiliarDocument1!: any;

  @Column({
    type: DataType.JSON,
  })
  auxiliarDocument2!: any;

  @Column({
    type: DataType.JSON,
  })
  auxiliarDocument3!: any;

  @Column({
    type: DataType.JSON,
  })
  vehicleRegistryCertificate!: any;

  @Column({
    type: DataType.JSON,
  })
  vehicleDealersInvoice!: any;

  @Column({
    type: DataType.STRING,
  })
  externalKey!: string;

  @Column({
    type: DataType.DATE,
  })
  disbursedAt!: Date;

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => Lead)
  lead: Lead = new Lead();

  @BelongsTo(() => Offer)
  offer: Offer = new Offer();

  @BelongsTo(() => Quote)
  quote: Quote = new Quote();

  @BelongsTo(() => Inventory)
  inventory: Inventory = new Inventory();

  @HasMany(() => LoanApplicationRevision, 'consumerLoanApplicationId')
  revisions: LoanApplicationRevision[] = [];

  @HasMany(() => LoanApplicationActivity, 'loanApplicationId')
  activities: LoanApplicationActivity[] = [];

  @HasMany(() => Person, 'loanApplicationId')
  people: Person[] = [];

  @BelongsTo(() => LoanApplicationStatus)
  loanApplicationStatus: LoanApplicationStatus = new LoanApplicationStatus();

  @BelongsTo(() => LoanApplicationStatusReason)
  loanApplicationStatusReason: LoanApplicationStatusReason = new LoanApplicationStatusReason();
}
