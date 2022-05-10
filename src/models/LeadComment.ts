import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Lead } from './Lead';
import { Profile } from './Profile';

@Table({
  tableName: 'leadComments',
  timestamps: true,
})
export class LeadComment extends Model {
  @Column({
    type: DataType.STRING,
  })
  comment!: string;

  @ForeignKey(() => Lead)
  @Column({
    type: DataType.INTEGER,
  })
  leadId!: number;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @BelongsTo(() => Lead, {
    onDelete: 'CASCADE',
  })
  lead!: Lead;

  @BelongsTo(() => Profile, {
    onDelete: 'CASCADE',
  })
  user!: Lead;
}
