import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { Quote } from './Quote';

@Table({
  tableName: 'quoteStatusReason',
  timestamps: true,
})
export class QuoteStatusReason extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.JSON,
  })
  description!: string;

  @HasMany(() => Quote)
  quotes: Quote[] = [];
}
