import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'stateGravamens',
  timestamps: true,
  indexes: [
    {
      fields: ['stateCode'],
    },
  ],
})
export class StateGravamen extends Model {
  @Column({
    type: DataType.CHAR(2),
  })
  stateCode!: string;

  @Column({
    type: DataType.STRING(100),
  })
  stateName!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  amount!: number;
}
