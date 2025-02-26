import { BelongsTo, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ProfileModel } from '../profile/profile.model';
import { TransactionModel } from '../transaction/transaction.model';

@Table({
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class AccountModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'profile_id',
  })
  declare profileId: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0.0,
  })
  declare balance: number;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'currency_id',
  })
  declare currencyId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_active',
    defaultValue: true,
  })
  declare isActive: boolean;

  @BelongsTo(() => ProfileModel, { foreignKey: 'profile_id' })
  declare profile: ProfileModel;

  @HasMany(() => TransactionModel, { foreignKey: 'source_account_id' })
  declare expendedTransactions: TransactionModel[];

  @HasMany(() => TransactionModel, { foreignKey: 'destination_account_id' })
  declare incomeTransactions: TransactionModel[];
}
