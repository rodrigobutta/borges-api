import { Model, DataType, Table, Column } from 'sequelize-typescript';

@Table({
  tableName: 'dealerCommissions',
  timestamps: true,

  indexes: [
    {
      fields: ['type', 'borgesScore', 'carAge'],
    },
    {
      fields: ['type'],
    },
  ],
})
export class DealerCommission extends Model {
  @Column({
    type: DataType.INTEGER,
  })
  dealerCommissionTableId!: number;

  @Column({
    type: DataType.STRING(2),
  })
  customerAnalysisScore!: string;

  @Column({
    type: DataType.INTEGER,
  })
  inventoryAge!: number;

  @Column({
    type: DataType.DECIMAL,
  })
  amount!: number;
}
