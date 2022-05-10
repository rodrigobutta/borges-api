import { Model, Table, Column, DataType, ForeignKey, HasMany, BelongsTo } from 'sequelize-typescript';
import { Account } from './Account';
import { Customer } from './Customer';
import { InventoryFile } from './InventoryFile';
import { InventoryStatus } from './InventoryStatus';
import { InventoryType } from './InventoryType';
import { VehicleGeneralConditions } from './VehicleGeneralConditions';
import { InventoryRevisions } from './InventoryRevisions';
import { Location } from './Location';
import { Quote } from './Quote';
import { Profile } from './Profile';
import { InventoryComment } from './InventoryComment';

@Table({
  tableName: 'inventories',
  timestamps: true,
  paranoid: true,
})
export class Inventory extends Model {
  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @ForeignKey(() => InventoryType)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryTypeId!: number;

  @ForeignKey(() => VehicleGeneralConditions)
  @Column({
    type: DataType.INTEGER,
  })
  vehicleGeneralConditionId!: number;

  @ForeignKey(() => InventoryStatus)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryStatusId!: number;

  @Column({
    type: DataType.STRING(20),
  })
  licensePlate!: string;

  @Column({
    type: DataType.STRING(20),
  })
  makerCountry!: string;

  @Column({
    type: DataType.SMALLINT,
  })
  year!: number;

  @Column({
    type: DataType.SMALLINT,
  })
  assemblyYear!: number;

  @Column({
    type: DataType.INTEGER,
  })
  saleValuation!: number;

  @Column({
    type: DataType.INTEGER,
  })
  mileage!: number;

  @Column({
    type: DataType.STRING(100),
  })
  brand!: string;

  @Column({
    type: DataType.STRING(100),
  })
  color!: string;

  @Column({
    type: DataType.STRING(100),
  })
  model!: string;

  @Column({
    type: DataType.STRING(100),
  })
  type!: string;

  @Column({
    type: DataType.STRING(20),
  })
  vin!: string;

  @Column({
    type: DataType.STRING,
  })
  floorPlanStatus!: string;

  @Column({
    type: DataType.STRING,
  })
  bancarizadorStatus!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  inactive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  sold!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  new!: boolean;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleConditionId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleConditionName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleClasificationId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleClasificationName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleBrandId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleBrandName!: string;

  @Column({
    type: DataType.STRING(800),
  })
  vehicleDescription!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleFamilyId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleFamilyName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleModelId!: string;

  @Column({
    type: DataType.STRING(200),
  })
  vehicleModelName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleMadeInId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleMadeInName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  vehicleFuelId!: string;

  @Column({
    type: DataType.STRING(100),
  })
  vehicleFuelName!: string;

  @Column({
    type: DataType.INTEGER,
  })
  vehicleYear!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  vehiclePriceAmount!: number;

  @Column({
    type: DataType.STRING,
  })
  vehiclePriceCurrency!: string;

  @Column({
    type: DataType.JSON,
  })
  vehicleParameters!: string;

  // TODO tmp to avoid old status problems
  @Column({
    type: DataType.INTEGER,
  })
  statusId!: number;

  // TODO tmp to avoid old location problems
  @Column({
    type: DataType.INTEGER,
  })
  locationId!: number;

  @Column({
    type: DataType.JSON,
  })
  imageCover!: any;

  @Column({
    type: DataType.JSON,
  })
  imageExteriorFront!: any;

  @Column({
    type: DataType.JSON,
  })
  imageExteriorBack!: any;

  @Column({
    type: DataType.JSON,
  })
  imageExteriorLeft!: any;

  @Column({
    type: DataType.JSON,
  })
  imageExteriorRight!: any;

  @Column({
    type: DataType.JSON,
  })
  imageInteriorFront!: any;

  @Column({
    type: DataType.JSON,
  })
  imageInteriorBack!: any;

  @Column({
    type: DataType.JSON,
  })
  imageInteriorDashboard!: any;

  @Column({
    type: DataType.JSON,
  })
  imageInteriorTrunk!: any;

  @Column({
    type: DataType.JSON,
  })
  imageOther1!: any;

  @Column({
    type: DataType.JSON,
  })
  imageOther2!: any;

  @Column({
    type: DataType.JSON,
  })
  imageOther3!: any;

  @Column({
    type: DataType.JSON,
  })
  certificatePlate!: any;

  @Column({
    type: DataType.JSON,
  })
  certificateVerification!: any;

  @Column({
    type: DataType.STRING,
  })
  mlInventoryId!: any;

  @Column({
    type: DataType.INTEGER,
  })
  mlSellerId!: any;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  borgesPrice!: number | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  vinType!: string | null;

  @Column({
    type: DataType.STRING,
  })
  registrationNumber!: string | null;

  @Column({
    type: DataType.STRING,
  })
  vehicleResidenceLocation!: string | null;

  @HasMany(() => Quote)
  quotes: Quote[] = [];

  @HasMany(() => InventoryFile, 'inventoryId')
  inventoryFiles: InventoryFile[] = [];

  @HasMany(() => InventoryComment)
  inventoryComments: InventoryComment[] = [];

  @HasMany(() => InventoryRevisions)
  inventoryRevisions: InventoryRevisions[] = [];

  @BelongsTo(() => Account, {
    foreignKey: 'accountId',
    targetKey: 'id',
  })
  account: Account = new Account();

  @BelongsTo(() => Location, {
    foreignKey: 'locationId',
    targetKey: 'id',
  })
  location: Location = new Location();

  @BelongsTo(() => Customer, {
    foreignKey: 'customerId',
    targetKey: 'id',
  })
  customer: Customer = new Customer();

  @BelongsTo(() => Profile, {
    foreignKey: 'userId',
    targetKey: 'id',
  })
  user: Profile = new Profile();

  @BelongsTo(() => InventoryType, {
    foreignKey: 'inventoryTypeId',
    targetKey: 'id',
  })
  inventoryType: InventoryType = new InventoryType();

  @BelongsTo(() => VehicleGeneralConditions, {
    foreignKey: 'vehicleGeneralConditionId',
    targetKey: 'id',
  })
  vehicleGeneralConditions: VehicleGeneralConditions = new VehicleGeneralConditions();

  @BelongsTo(() => InventoryStatus, {
    foreignKey: 'inventoryStatusId',
    targetKey: 'id',
  })
  inventoryStatus: InventoryStatus = new InventoryStatus();
}
