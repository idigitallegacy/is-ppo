import { Module } from '@nestjs/common';
import { CreateAccountHandler } from './create/create-account.handler';
import { CreateProfileHandler } from './create/create-profile.handler';
import { DepositMoneyHandler } from './update/deposit-money.handler';
import { TransferMoneyHandler } from './update/transfer-money.handler';
import { WithdrawMoneyHandler } from './update/withdraw-money.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfileModule } from '../../models/profile/profile.module';
import { AccountModule } from '../../models/account/account.module';
import { CurrencyModule } from '../../models/currency/currency.module';
import { TransactionModule } from '../../models/transaction/transaction.module';
import { InnerTransferMoneyHandler } from './internal/inner-transfer-money.handler';
import { OuterTransferMoneyHandler } from './internal/outer-transfer-money.handler';
import { VerifyTransactionHandler } from './internal/verify-transaction.handler';
import { ActivateAccountHandler } from './update/activate-account.handler';
import { DeactivateAccountHandler } from './update/deactivate-account.handler';

@Module({
  imports: [CqrsModule, ProfileModule, AccountModule, CurrencyModule, TransactionModule],
  providers: [
    CreateAccountHandler,
    CreateProfileHandler,
    DepositMoneyHandler,
    WithdrawMoneyHandler,
    TransferMoneyHandler,
    InnerTransferMoneyHandler,
    OuterTransferMoneyHandler,
    VerifyTransactionHandler,
    ActivateAccountHandler,
    DeactivateAccountHandler,
  ],
})
export class CqrsCommandsModule {}
