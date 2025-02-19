import { Module } from '@nestjs/common';
import { AccountModule } from '../../../models/account/account.module';
import { CurrencyModule } from '../../../models/currency/currency.module';
import { ProfileModule } from '../../../models/profile/profile.module';
import { TransactionModule } from '../../../models/transaction/transaction.module';
import { GetTransferMoneyEntitiesHandler } from './get-transfer-money-entities.handler';
import { GetNormalizedEntitiesHandler } from './get-normalized-entities.handler';
import { ValidateDepositHandler } from './validate-deposit.handler';
import { ValidateWithdrawHandler } from './validate-withdraw.handler';

@Module({
  imports: [AccountModule, CurrencyModule, ProfileModule, TransactionModule],
  providers: [
    GetTransferMoneyEntitiesHandler,
    GetNormalizedEntitiesHandler,
    ValidateDepositHandler,
    ValidateWithdrawHandler,
  ],
})
export class ValidatorsCqrsQueriesModule {}
