import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'currencies',
  createdAt: false,
  updatedAt: false,
})
export class CurrencyModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare ticker: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;
}
