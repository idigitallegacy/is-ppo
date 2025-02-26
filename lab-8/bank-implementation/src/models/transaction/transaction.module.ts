import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionModel } from './transaction.model';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';

@Module({
  imports: [SequelizeModule.forFeature([TransactionModel])],
  providers: [TransactionRepository, TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
