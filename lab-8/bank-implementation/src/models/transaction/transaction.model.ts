import { BelongsTo, Column, DataType, Model, Table } from 'sequelize-typescript';
import { TransactionPurpose, TransactionStatus } from './transaction.enum';
import { AccountModel } from '../account/account.model';
import { CurrencyModel } from '../currency/currency.model';

@Table({
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class TransactionModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    field: 'source_account_id',
  })
  declare sourceAccountId: string;

  @Column({
    type: DataType.UUID,
    field: 'destination_account_id',
  })
  declare destinationAccountId: string;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(TransactionPurpose),
  })
  declare purpose: TransactionPurpose;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'currency_id',
  })
  declare currencyId: string;

  @Column({
    type: DataType.ENUM,
    allowNull: false,
    values: Object.values(TransactionStatus),
    defaultValue: TransactionStatus.NEW,
  })
  declare status: TransactionStatus;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
    field: 'fail_reason',
  })
  declare failReason?: string;

  @BelongsTo(() => AccountModel, { foreignKey: 'source_account_id' })
  declare sourceAccount?: AccountModel;

  @BelongsTo(() => AccountModel, { foreignKey: 'destination_account_id' })
  declare destinationAccount?: AccountModel;

  @BelongsTo(() => CurrencyModel, { foreignKey: 'currency_id' })
  declare currency: CurrencyModel;
}
