import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { AccountsModule } from './accounts/accounts.module';
import { RouterModule } from '@nestjs/core';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ProfilesModule,
    AccountsModule,
    TransactionsModule,
    RouterModule.register([
      {
        path: 'profiles',
        module: ProfilesModule,
      },
      {
        path: 'accounts',
        module: AccountsModule,
      },
      {
        path: 'transactions',
        module: TransactionsModule,
      },
    ]),
  ],
})
export class ApiModule {}
