import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'variables',
  timestamps: true,
  indexes: [
    {
      fields: ['reference'],
    },
  ],
})
export class Variable extends Model {
  @Column({
    type: DataType.STRING(50),
  })
  name!: string;

  @Column({
    type: DataType.JSON,
  })
  value!: JSON;
}
