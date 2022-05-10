import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Inventory } from './Inventory';

@Table({
  tableName: 'inventoryTypes',
  timestamps: true,
})
export class InventoryType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => Inventory)
  inventories: Inventory[] = [];
}
