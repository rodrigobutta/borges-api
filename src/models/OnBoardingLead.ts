import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'onBoardingLead',
  timestamps: true,
})
export class OnBoardingLead extends Model {
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  avgSixYearPlus!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  avgSixYear!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  avgThreeYear!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  avgZeroKM!: number;

  @Column({
    type: DataType.STRING,
  })
  city!: string;

  @Column({
    type: DataType.STRING,
  })
  companyName!: string;

  @Column({
    type: DataType.STRING,
  })
  countBranch!: string;

  @Column({
    type: DataType.STRING,
  })
  countEmployee!: string;

  @Column({
    type: DataType.INTEGER,
  })
  countSixYearPlus!: number;

  @Column({
    type: DataType.INTEGER,
  })
  countSixYear!: number;

  @Column({
    type: DataType.INTEGER,
  })
  countThreeYear!: number;

  @Column({
    type: DataType.INTEGER,
  })
  countZeroKM!: number;

  @Column({
    type: DataType.INTEGER,
  })
  countMonthlyUsedSales!: number;

  @Column({
    type: DataType.INTEGER,
  })
  countMonthlyZeroKMSales!: number;

  @Column({
    type: DataType.STRING,
  })
  deviceVendor!: string;

  @Column({
    type: DataType.STRING,
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
  latitude!: string;

  @Column({
    type: DataType.STRING,
  })
  longitude!: string;

  @Column({
    type: DataType.STRING,
  })
  mobilePhone!: string;

  @Column({
    type: DataType.STRING,
  })
  osName!: string;

  @Column({
    type: DataType.STRING,
  })
  osVersion!: string;

  @Column({
    type: DataType.STRING,
  })
  referrer!: string;

  @Column({
    type: DataType.STRING,
  })
  state!: string;

  @Column({
    type: DataType.STRING,
  })
  zipCode!: string;
}
