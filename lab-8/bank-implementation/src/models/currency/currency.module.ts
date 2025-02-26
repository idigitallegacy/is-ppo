import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CurrencyModel } from './currency.model';
import { CurrencyRepository } from './currency.repository';
import { CurrencyService } from './currency.service';

@Module({
  imports: [SequelizeModule.forFeature([CurrencyModel])],
  providers: [CurrencyRepository, CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
