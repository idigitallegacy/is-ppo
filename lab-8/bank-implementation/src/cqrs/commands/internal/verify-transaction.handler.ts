import { CommandHandler, EventBus, IQueryHandler } from '@nestjs/cqrs';
import { VerifyTransactionSubcommand } from './verify-transaction.subcommand';
import { AccountService } from '../../../models/account/account.service';
import { TransactionService } from '../../../models/transaction/transaction.service';
import { ProfileService } from '../../../models/profile/profile.service';
import { AccountModel } from '../../../models/account/account.model';
import {
  TransactionPurpose,
  TransactionStatus,
} from '../../../models/transaction/transaction.enum';
import { BaseCommandHandler } from '../../base/base-command.handler';

@CommandHandler(VerifyTransactionSubcommand)
export class VerifyTransactionHandler
  extends BaseCommandHandler
  implements IQueryHandler<VerifyTransactionSubcommand>
{
  private readonly maxProfileFundsAmount = 25e6;

  constructor(
    protected readonly eventBus: EventBus,
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService,
    private readonly profileService: ProfileService
  ) {
    super(eventBus, VerifyTransactionSubcommand.name);
  }

  async execute(query: VerifyTransactionSubcommand): Promise<{ traceId: string }> {
    this.interceptExecution({ traceId: query.traceId });

    return this.handleCommand(query)
      .then((result) => {
        return this.interceptHandledResult(result);
      })
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(
    command: VerifyTransactionSubcommand
  ): Promise<{ traceId: string }> {
    const transaction = await this.transactionService.findById(command.traceId);

    if (!transaction) {
      return { traceId: command.traceId };
    }

    let sourceAccount: AccountModel;
    let targetAccount: AccountModel;

    try {
      sourceAccount = await this.accountService.getAndValidateAccountForWithdraw(
        transaction.sourceAccountId,
        transaction.amount,
        transaction.currencyId,
        transaction.id
      );
    } catch (error) {
      await this.transactionService.failTransaction(
        transaction.id,
        `Cannot getAndValidateAccountForWithdraw: ${error.message}`
      );

      return { traceId: transaction.id };
    }

    try {
      targetAccount = await this.accountService.getAndValidateAccountForDeposit(
        transaction.destinationAccountId,
        transaction.amount,
        transaction.currencyId,
        transaction.id
      );
    } catch (error) {
      await this.transactionService.failTransaction(
        transaction.id,
        `Cannot getAndValidateAccountForDeposit: ${error.message}`
      );

      return { traceId: transaction.id };
    }

    if (!sourceAccount || !targetAccount) {
      await this.transactionService.failTransaction(transaction.id, ``);

      return { traceId: transaction.id };
    }

    const allDestinationAccounts = await this.accountService.findAllByProfileId(
      targetAccount.profileId
    );
    const destinationAccountBalance = this.getTotalProfileBalance(allDestinationAccounts);

    if (destinationAccountBalance + transaction.amount > this.maxProfileFundsAmount) {
      await this.transactionService.failTransaction(
        transaction.id,
        `Transaction leads the destination profile limit of ${this.maxProfileFundsAmount} to be exceeded.`
      );

      return { traceId: transaction.id };
    }

    await this.transactionService.approveTransaction(transaction.id);

    return { traceId: transaction.id };
  }

  private getTotalProfileBalance(accounts: AccountModel[]) {
    return accounts.reduce((amount, account) => {
      const pendingTransactionsAmount = [
        ...account.expendedTransactions,
        ...account.incomeTransactions,
      ]
        .filter((transaction) => transaction.status === TransactionStatus.APPROVED)
        .map((transaction) => {
          if (transaction.purpose === TransactionPurpose.DEPOSIT) {
            return transaction.amount;
          }

          if (transaction.purpose === TransactionPurpose.WITHDRAW) {
            return 0 - transaction.amount;
          }

          if (transaction.purpose === TransactionPurpose.INNER_TRANSFER) {
            return 0;
          }

          if (transaction.purpose === TransactionPurpose.EXTERNAL_TRANSFER) {
            if (transaction.sourceAccountId === account.id) {
              return 0 - transaction.amount;
            }

            if (transaction.destinationAccountId === account.id) {
              return transaction.amount;
            }
          }

          return transaction.amount;
        })
        .reduce((sum, transactionAmount) => sum + transactionAmount, 0.0);

      return amount + account.balance + pendingTransactionsAmount;
    }, 0.0);
  }
}
