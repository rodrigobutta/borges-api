import { Model, Table, Column, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Account } from './Account';
import { Quote } from './Quote';
import { QuoteStatus } from './QuoteStatus';
import { Profile } from './Profile';

@Table({
  tableName: 'quoteActivity',
  timestamps: true,
})
export class QuoteActivity extends Model {
  @ForeignKey(() => Quote)
  @Column({
    type: DataType.INTEGER,
  })
  quoteId!: number;

  @ForeignKey(() => QuoteStatus)
  @Column({
    type: DataType.INTEGER,
  })
  quoteInstanceId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  auto!: boolean;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @BelongsTo(() => Account)
  account: Account = new Account();

  @BelongsTo(() => Profile)
  user: Profile = new Profile();

  @BelongsTo(() => Quote, {
    foreignKey: 'quoteId',
    targetKey: 'id',
  })
  quote: Quote = new Quote();

  @BelongsTo(() => QuoteStatus, {
    foreignKey: 'quoteInstanceId',
    targetKey: 'id',
  })
  status: QuoteStatus = new QuoteStatus();
}
