import { Model, DataType, Table, Column, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Account } from './Account';

const OBSERVADO = 'Verificado';
const EN_REVISION = 'Sob Revisão';

@Table({
  tableName: 'accountFiles',
  timestamps: true,
  indexes: [
    {
      fields: ['accountId', 'name'],
      unique: true,
    },
  ],
})
export class AccountFiles extends Model {
  @Column({
    type: DataType.STRING(45),
  })
  name!: string;

  @Column({
    type: DataType.STRING(256),
  })
  originalName!: string;

  @Column({
    type: DataType.STRING(40),
  })
  mimetype!: string;

  @Column({
    type: DataType.STRING(256),
  })
  url!: string;

  @Column({
    type: DataType.STRING(256),
  })
  comment!: string;

  @Column({
    type: DataType.ENUM('Aprovado', EN_REVISION, OBSERVADO),
  })
  status!: [];

  @ForeignKey(() => Account)
  @Column({
    type: DataType.INTEGER,
  })
  accountId!: number;

  @BelongsTo(() => Account, {
    onDelete: 'CASCADE',
  })
  account: Account = new Account();
}
