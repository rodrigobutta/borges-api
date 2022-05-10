import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript';

import { LoanApplication } from './LoanApplication';

@Table({
  tableName: 'loanApplicationStatus',
  timestamps: true,
})
export class LoanApplicationStatus extends Model {
  @Column({
    type: DataType.STRING(40),
  })
  code!: string;

  @Column({
    type: DataType.STRING(80),
  })
  name!: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  locked!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  canSubmitToDealer!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  canSubmitToPanel!: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  canSubmitToProvider!: boolean;

  @Column({
    type: DataType.STRING(40),
  })
  type!: string;

  @Column({
    type: DataType.JSON,
  })
  description!: any;

  @HasMany(() => LoanApplication)
  loanApplications: LoanApplication[] = [];
}
