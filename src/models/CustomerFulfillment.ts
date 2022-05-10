import { Model, Table, Column, DataType } from 'sequelize-typescript';

// import { Customer } from './Customer';

@Table({
  tableName: 'customerFulfillment',
  timestamps: true,
})
export class CustomerFulfillment extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  // @HasMany(() => Customer)
  // customers: Customer[] = []
}
