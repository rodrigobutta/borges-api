import { Model, DataType, Table, Column } from 'sequelize-typescript';

@Table({
  tableName: 'banks',
  timestamps: true,
})
export class Bank extends Model {
  @Column({
    type: DataType.STRING(100),
  })
  shortName!: string;

  @Column({
    type: DataType.STRING(3),
  })
  bankCode!: string;

  @Column({
    type: DataType.STRING(255),
  })
  largeName!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  COMPEmember!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  fav!: boolean;
}
