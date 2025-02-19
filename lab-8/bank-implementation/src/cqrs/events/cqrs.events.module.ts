import { Module } from '@nestjs/common';
import { TransactionModule } from '../../models/transaction/transaction.module';
import { TransferMoneySagaHandler } from './internal/transfer-money.saga.handler';
import { AccountModule } from '../../models/account/account.module';

@Module({
  imports: [TransactionModule, AccountModule],
  providers: [TransferMoneySagaHandler],
})
export class CqrsEventsModule {}
