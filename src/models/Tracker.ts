import { Model, Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({
  tableName: 'tracker',
  timestamps: true,
})
export class Tracker extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Profile)
  @Column({
    type: DataType.INTEGER,
  })
  profileId!: number;

  @Column({
    type: DataType.STRING,
  })
  code!: string;

  @BelongsTo(() => Profile)
  profile: Profile = new Profile();
}
