import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'documentSignatures',
  timestamps: true,
  indexes: [
    {
      fields: ['customerId', 'documentId'],
    },
    {
      fields: ['id'],
    },
  ],
})
export class DocumentSignature extends Model {
  @Column({
    type: DataType.INTEGER,
  })
  userId!: number;

  @Column({
    type: DataType.INTEGER,
  })
  documentId!: number;

  @Column({
    type: DataType.INTEGER,
  })
  customerId!: number;

  @Column({
    type: DataType.STRING(200),
  })
  signedFile!: string;
}
