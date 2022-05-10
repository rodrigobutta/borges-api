import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Inventory } from './Inventory';
import { Profile } from './Profile';

@Table({
  tableName: 'inventoryFiles',
  timestamps: true,
})
export class InventoryFile extends Model {
  @Column({
    type: DataType.STRING(100),
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
  })
  url!: string;

  @Column({
    type: DataType.STRING(50),
  })
  type?: string;

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

  @BelongsTo(() => Inventory, 'id')
  inventory: Inventory = new Inventory();
}
