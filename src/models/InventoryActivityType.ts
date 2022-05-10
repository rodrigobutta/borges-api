import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { InventoryActivity } from './InventoryActivity';

@Table({
  tableName: 'inventoryActivityTypes',
  timestamps: true,
})
export class InventoryActivityType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => InventoryActivity)
  activities: InventoryActivity[] = [];
}
