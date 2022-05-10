import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'applicationInstances',
  timestamps: true,
})
export class ApplicationInstance extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;
}
