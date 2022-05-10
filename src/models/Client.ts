import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'client',
  timestamps: true,
})
export class Client extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;
}
