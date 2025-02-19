import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ProfileModel } from './profile/profile.model';
import { ProfileModule } from './profile/profile.module';
import { AccountModule } from './account/account.module';
import { AccountModel } from './account/account.model';
import { CurrencyModel } from './currency/currency.model';
import { CurrencyModule } from './currency/currency.module';

import 'dotenv/config';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionModel } from './transaction/transaction.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [ProfileModel, AccountModel, CurrencyModel, TransactionModel],
      logging: false,
    }),
    ProfileModule,
    AccountModule,
    CurrencyModule,
    TransactionModule,
  ],
})
export class ModelsModule {}
