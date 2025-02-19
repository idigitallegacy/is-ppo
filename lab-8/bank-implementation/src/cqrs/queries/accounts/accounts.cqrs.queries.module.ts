import { Module } from '@nestjs/common';
import { AccountModule } from '../../../models/account/account.module';
import { GetAccountQueryHandler } from './get-account-query.handler';

@Module({
  imports: [AccountModule],
  providers: [GetAccountQueryHandler],
})
export class AccountsCqrsQueriesModule {}
