import { Module } from '@nestjs/common';
import { TransactionModule } from '../../../models/transaction/transaction.module';
import { GetTransactionHandler } from './get-transaction.handler';

@Module({
  imports: [TransactionModule],
  providers: [GetTransactionHandler],
})
export class TransactionsCqrsQueriesModule {}