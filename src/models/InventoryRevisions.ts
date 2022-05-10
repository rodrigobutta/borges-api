import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Profile } from './Profile';
import { Inventory } from './Inventory';

@Table({
  tableName: 'inventoryRevisions',
  timestamps: true,
})
export class InventoryRevisions extends Model {
  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.INTEGER,
  })
  inventoryId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  backofficeUserId!: number;

  @Column({
    type: DataType.STRING(512),
  })
  message!: any;

  @BelongsTo(() => Inventory, 'id')
  inventory: Inventory = new Inventory();
}
