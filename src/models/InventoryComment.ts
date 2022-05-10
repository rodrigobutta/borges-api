import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Inventory } from './Inventory';
import { Profile } from './Profile';

@Table({
  tableName: 'inventoryComments',
  timestamps: true,
})
export class InventoryComment extends Model {
  @Column({
    type: DataType.STRING(255),
  })
  comment!: string;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.NUMBER,
  })
  userId?: number;

  @ForeignKey(() => Inventory)
  @Column({
    type: DataType.NUMBER,
  })
  inventoryId!: number;

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => Inventory)
  inventory: Inventory = new Inventory();
}
