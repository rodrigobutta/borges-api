import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { LoanApplication } from './LoanApplication';

@Table({
  tableName: 'people',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['loanApplicationId', 'loanApplicationNature'],
    },
  ],
})
export class Person extends Model {
  @ForeignKey(() => LoanApplication)
  @Column({
    type: DataType.INTEGER,
  })
  loanApplicationId!: number;

  @Column({
    type: DataType.STRING(40),
  })
  loanApplicationNature!: string;

  @Column({
    type: DataType.STRING(40),
  })
  firstName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  lastName!: string | null;

  @Column({
    type: DataType.DATE,
  })
  birthDate!: Date | null;

  @Column({
    type: DataType.STRING(40),
  })
  birthPlace!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  birthCountry!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  rg!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  emitter!: string | null;

  @Column({
    type: DataType.DATE,
  })
  emitionDate!: Date | null;

  @Column({
    type: DataType.STRING(40),
  })
  fathersName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  mothersName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  citizenNumber!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  cnh!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  gender!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  civilStatus!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  dependents!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  studies!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeType!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeRent!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeAge!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeAddress!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeNeighbour!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeCep!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeCity!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homeState!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  homePhone!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  cellPhone!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  personalEmail!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  professionalEmail!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  profession!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyCnpj!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyPhone!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyNeighbour!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyCep!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyCity!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyState!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyJobPossition!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyRelation!: string | null;

  @Column({
    type: DataType.DATE,
  })
  companyStartDate!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyMainSalaryAmount!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companyMainSalaryCheck!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companySecondaryAmount!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  companySecondaryCheck!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankContactPhone!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankContactName!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankCheckLimit!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankAccountNumber!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankAgency!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankAccountType!: string | null;

  @Column({
    type: DataType.STRING(40),
  })
  bankCredit!: string | null;

  @Column({
    type: DataType.DATE,
  })
  bankFromDate!: Date | null;

  @Column({
    type: DataType.TINYINT,
  })
  hadGravamen!: number | null;

  @Column({
    type: DataType.DECIMAL,
  })
  homeAddressNumber!: number | null;

  @Column({
    type: DataType.DECIMAL,
  })
  homePhoneCountryCode!: number | null;

  @Column({
    type: DataType.DECIMAL,
  })
  homePhoneAreaCode!: number | null;

  @Column({
    type: DataType.DECIMAL,
  })
  cellPhoneCountryCode!: number | null;

  @Column({
    type: DataType.DECIMAL,
  })
  cellPhoneAreaCode!: number | null;

  @Column({
    type: DataType.STRING(200),
  })
  homeComments!: string | null;

  @Column({
    type: DataType.TINYINT,
  })
  isPep!: number | null;

  @Column({
    type: DataType.STRING(100),
  })
  residenceCountry!: string | null;

  @Column({
    type: DataType.DATE,
  })
  identityCardExpirationDate!: Date | null;

  @BelongsTo(() => LoanApplication)
  loanApplication: LoanApplication = new LoanApplication();
}
