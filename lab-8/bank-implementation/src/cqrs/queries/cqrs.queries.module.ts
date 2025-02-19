import { Module } from '@nestjs/common';
import { AccountsCqrsQueriesModule } from './accounts/accounts.cqrs.queries.module';
import { ValidatorsCqrsQueriesModule } from './validators/validators.cqrs.queries.module';
import { TransactionsCqrsQueriesModule } from './transactions/transactions.cqrs.queries.module';

@Module({
  imports: [AccountsCqrsQueriesModule, TransactionsCqrsQueriesModule, ValidatorsCqrsQueriesModule],
})
export class CqrsQueriesModule {}
