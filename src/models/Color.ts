import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'colors',
  timestamps: true,
})
export class Color extends Model {
  @Column({
    type: DataType.STRING(20),
  })
  name!: string;

  @Column({
    type: DataType.STRING(6),
  })
  colorCode!: string;
}
