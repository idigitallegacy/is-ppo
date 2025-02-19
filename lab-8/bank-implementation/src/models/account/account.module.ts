import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AccountModel } from './account.model';
import { ProfileModule } from '../profile/profile.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [SequelizeModule.forFeature([AccountModel]), ProfileModule, CurrencyModule],
  providers: [AccountRepository, AccountService],
  exports: [AccountService],
})
export class AccountModule {}
