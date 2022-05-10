import { Model, Table, Column, DataType, HasMany, ForeignKey } from 'sequelize-typescript';

import { QuoteActivity } from './QuoteActivity';
import { Quote } from './Quote';

@Table({
  tableName: 'quoteInstances',
  timestamps: true,
})
export class QuoteStatus extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @ForeignKey(() => QuoteStatus)
  @Column({
    type: DataType.INTEGER,
    unique: false,
  })
  parentQuoteId!: number; // TODO rename to parentQuoteStatusId

  @Column({
    type: DataType.INTEGER,
  })
  sort!: number;

  @Column({
    type: DataType.JSON,
  })
  data!: any;

  @Column({
    type: DataType.BOOLEAN,
  })
  autoOnly!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  locked!: boolean;

  @Column({
    type: DataType.JSON,
  })
  description!: any;

  @Column({
    type: DataType.BOOLEAN,
  })
  inventorySearchable!: boolean;

  @HasMany(() => QuoteActivity)
  activity: QuoteActivity[] = [];

  @HasMany(() => Quote)
  quotes: Quote[] = [];
}
