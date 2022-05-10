import { Model, Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Inventory } from './Inventory';
import { Lead } from './Lead';
import { Location } from './Location';
import { Profile } from './Profile';
import { SalePayMethod } from './SalePayMethod';
// import { SalePayMethod } from "./SalePayMethod";

@Table({
  tableName: 'sales',
  timestamps: true,
})
export class Sales extends Model {
  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.INTEGER,
  })
  locationId!: number;

  @Column({
    type: DataType.STRING,
  })
  leadChannel!: string;

  @Column({
    type: DataType.DATEONLY,
  })
  date!: Date;

  @Column({
    type: DataType.INTEGER,
  })
  soldPrice!: number;

  @Column({
    type: DataType.INTEGER,
  })
  downPayment!: number;

  @Column({
    type: DataType.INTEGER,
  })
  loan!: number;

  @Column({
    type: DataType.INTEGER,
  })
  term!: number;

  @Column({
    type: DataType.INTEGER,
  })
  installment!: number;

  @Column({
    type: DataType.STRING(40),
  })
  bank!: string;

  @Column({
    type: DataType.INTEGER,
  })
  usedCarRenavam!: number;

  @Column({
    type: DataType.INTEGER,
  })
  usedCarAmount!: number;

  @Column({
    type: DataType.STRING(40),
  })
  usedCarDesc!: string;

  @Column({
    type: DataType.STRING(10),
  })
  usedCarPlate!: string;

  @Column({
    type: DataType.STRING(20),
  })
  usedCarFipeCode!: string;

  @Column({
    type: DataType.INTEGER,
  })
  usedCarFipeAvl!: number;

  @Column({
    type: DataType.STRING(20),
  })
  financedPayment!: string;

  @HasMany(() => SalePayMethod, {
    onDelete: 'CASCADE',
  })
  salePayMethods: [] = [];

  @BelongsTo(() => Lead)
  lead: Lead = new Lead();

  @BelongsTo(() => Location)
  location: Location = new Location();

  @BelongsTo(() => Inventory)
  inventory: Inventory = new Inventory();

  @BelongsTo(() => Profile, {
    foreignKey: 'userId',
    targetKey: 'id',
  })
  user: Profile = new Profile();
}
