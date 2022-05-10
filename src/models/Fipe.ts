import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'fipe',
  timestamps: true,
})
export class Fipe extends Model {
  @Column({
    type: DataType.STRING,
  })
  brand!: string;

  @Column({
    type: DataType.INTEGER,
  })
  brandFipeId!: number;

  @Column({
    type: DataType.STRING,
  })
  model!: string;

  @Column({
    type: DataType.INTEGER,
  })
  modelFipeId!: number;

  @Column({
    type: DataType.INTEGER,
  })
  year!: number;

  @Column({
    type: DataType.INTEGER,
  })
  valuation!: number;

  @Column({
    type: DataType.BOOLEAN,
  })
  is0KM!: boolean;

  @Column({
    type: DataType.INTEGER,
  })
  referenceCode!: number;

  @Column({
    type: DataType.STRING,
  })
  fuel!: string;

  @Column({
    type: DataType.STRING,
  })
  monthReference!: string;
}
