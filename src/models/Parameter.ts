import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'parameter',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['space', 'name'],
    },
  ],
})
export class Parameter extends Model {
  @Column({
    type: DataType.STRING(3),
  })
  space!: string;

  @Column({
    type: DataType.STRING(3),
  })
  name!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  value!: number;

  @Column({
    type: DataType.JSON,
  })
  valueJSON!: any;
}
