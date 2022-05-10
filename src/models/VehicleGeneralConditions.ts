import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Inventory } from './Inventory';

@Table({
  tableName: 'vehicleGeneralConditions',
  timestamps: true,
})
export class VehicleGeneralConditions extends Model {
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
