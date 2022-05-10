import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'onBoardings',
  timestamps: true,
})

// Reduced model, we grabonly de fields we need from that old structure
export class Onboard extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
  })
  companyName!: string;

  @Column({
    type: DataType.STRING,
  })
  city!: string;

  @Column({
    type: DataType.STRING,
  })
  state!: string;

  @Column({
    type: DataType.STRING,
  })
  zipCode!: string;
}
