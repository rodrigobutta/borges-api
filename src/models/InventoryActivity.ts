import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Account } from './Account';
import { Lead } from './Lead';
import { InventoryActivityType } from './InventoryActivityType';
import { Profile } from './Profile';
import { Inventory } from './Inventory';

@Table({
  tableName: 'inventoryActivity',
  timestamps: true,
})
export class InventoryActivity extends Model {
  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => InventoryActivityType)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryActivityTypeId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @BelongsTo(() => Lead, {
    foreignKey: 'leadId',
    targetKey: 'id',
  })
  lead: Lead = new Lead();

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => InventoryActivityType)
  activityType: InventoryActivityType = new InventoryActivityType();
}
