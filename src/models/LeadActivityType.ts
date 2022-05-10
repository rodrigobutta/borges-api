import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { LeadActivity } from './LeadActivity';

@Table({
  tableName: 'leadActivityTypes',
  timestamps: true,
})
export class LeadActivityType extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @HasMany(() => LeadActivity)
  activities: LeadActivity[] = [];
}
