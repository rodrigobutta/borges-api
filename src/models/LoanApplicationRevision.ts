import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { LoanApplication } from './LoanApplication';
import { Profile } from './Profile';

@Table({
  tableName: 'consumerLoanApplicationRevisions',
  timestamps: true,
  indexes: [
    {
      fields: ['consumerLoanApplicationId'],
    },
  ],
})
export class LoanApplicationRevision extends Model {
  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => LoanApplication)
  @Column({
    type: DataType.INTEGER,
  })
  consumerLoanApplicationId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  responseUserId!: number;

  // @ForeignKey(() => Quote)
  // @Column({
  //   type: DataType.INTEGER,
  // })
  // consumerLoanRequestId!: number;

  @Column({
    type: DataType.JSON,
  })
  state!: any;

  @Column({
    type: DataType.DATE,
  })
  responseAt!: Date;

  @Column({
    type: DataType.STRING,
  })
  responseType!: string;

  @Column({
    type: DataType.JSON,
  })
  responseErrors!: any;

  @Column({
    type: DataType.JSON,
  })
  responseLocked!: any;

  @Column({
    type: DataType.STRING,
  })
  responseNotes!: string;

  @BelongsTo(() => Profile, {
    foreignKey: 'userId',
    targetKey: 'id',
  })
  user: Profile = new Profile();

  @BelongsTo(() => Profile, {
    foreignKey: 'responseUserId',
    targetKey: 'id',
  })
  responseUser: Profile = new Profile();

  // @BelongsTo(() => Quote)
  // quote: Quote = new Quote();
}
