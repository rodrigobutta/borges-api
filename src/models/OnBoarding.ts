import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'onBoardings',
  timestamps: true,
})
export class OnBoarding extends Model {
  @Column({
    type: DataType.STRING(45),
  })
  firstName!: string;

  @Column({
    type: DataType.STRING(45),
  })
  lastName!: string;

  @Column({
    type: DataType.STRING(45),
  })
  email!: string;

  @Column({
    type: DataType.STRING(45),
  })
  companyName!: string;

  @Column({
    type: DataType.STRING(14),
  })
  companyIDNumber!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countEmployee!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countBranch!: string;

  @Column({
    type: DataType.STRING(45),
  })
  city!: string;

  @Column({
    type: DataType.STRING(45),
  })
  state!: string;

  @Column({
    type: DataType.STRING(45),
  })
  zipCode!: string;

  @Column({
    type: DataType.STRING(45),
  })
  avgSixYear!: string;

  @Column({
    type: DataType.STRING(45),
  })
  avgSixYearPlus!: string;

  @Column({
    type: DataType.STRING(45),
  })
  avgThreeYear!: string;

  @Column({
    type: DataType.STRING(45),
  })
  avgZeroKM!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countMonthlyUsedSales!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countSixYear!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countSixYearPlus!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countThreeYear!: string;

  @Column({
    type: DataType.STRING(45),
  })
  countZeroKM!: string;

  @Column({
    type: DataType.DATE,
  })
  createdAt!: Date;

  @Column({
    type: DataType.DATE,
  })
  updatedAt!: Date;
}
