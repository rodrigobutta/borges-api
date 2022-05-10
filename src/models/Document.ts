import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['scr'],
    },
    {
      fields: ['id'],
    },
  ],
})
export class Document extends Model {
  @Column({
    type: DataType.STRING(100),
  })
  name!: string;

  @Column({
    type: DataType.STRING(100),
  })
  title!: string;

  @Column({
    type: DataType.STRING(100),
  })
  sourceFile!: string;

  @Column({
    type: DataType.STRING(100),
  })
  outputFile!: string;

  @Column({
    type: DataType.JSON,
  })
  template!: string;
}
