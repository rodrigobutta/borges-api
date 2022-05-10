import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Customer } from './Customer';

@Table({
  tableName: 'customerFulfillmentStatus',
  timestamps: true,
})
export class CustomerFulfillmentStatus extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => Customer)
  customers: Customer[] = [];
}
