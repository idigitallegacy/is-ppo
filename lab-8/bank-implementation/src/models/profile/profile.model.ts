import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { AccountModel } from '../account/account.model';

@Table({
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ProfileModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @HasMany(() => AccountModel, { foreignKey: 'profile_id' })
  declare accounts: AccountModel[];
}
