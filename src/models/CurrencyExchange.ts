import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({
  tableName: 'currencyExchange',
  timestamps: true,
  indexes: [
    {
      fields: ['from', 'to'],
    },
  ],
})
export class CurrencyExchange extends Model {
  @Column({
    type: DataType.STRING(3),
  })
  from!: string;

  @Column({
    type: DataType.STRING(3),
  })
  to!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  value!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @BelongsTo(() => Profile)
  user: Profile = new Profile();
}
