import { Model, DataType, Table, Column } from 'sequelize-typescript';

@Table({
  tableName: 'offerLogRequests',
  timestamps: true,
})
export class OfferLogRequest extends Model {
  @Column({
    type: DataType.JSON,
  })
  raw!: any;

  @Column({
    type: DataType.NUMBER,
  })
  quoteId!: number;
}
