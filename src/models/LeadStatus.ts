import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';
import { Lead } from './Lead';

export const VISITOR: string = 'visitor';
export const INTERESTED: string = 'interested';
export const BUYER: string = 'buyer';
export const NOT_INTERESTED: string = 'not-interested';

@Table({
  tableName: 'leadStatus',
  timestamps: true,
})
export class LeadStatus extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => Lead)
  leads: Lead[] = [];
}
