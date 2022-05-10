import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Inventory } from './Inventory';

@Table({
  tableName: 'inventoryStatus',
  timestamps: true,
})
export class InventoryStatus extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  searchable!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  locked!: boolean;

  @HasMany(() => Inventory)
  inventories: Inventory[] = [];
}
