import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountService } from '../../../models/account/account.service';
import { ConflictException } from '@nestjs/common';
import { ValidateDepositQuery } from './validate-deposit.query';
import { AccountModel } from '../../../models/account/account.model';
import {
  TransactionPurpose,
  TransactionStatus,
} from '../../../models/transaction/transaction.enum';
import { BaseQueryHandler } from '../../base/base-query.handler';
import { ValidationResponse } from '../../base/validation-response.interface';

@QueryHandler(ValidateDepositQuery)
export class ValidateDepositHandler
  extends BaseQueryHandler
  implements IQueryHandler<ValidateDepositQuery>
{
  private readonly maxProfileFundsAmount = 25e6;

  constructor(
    protected readonly eventBus: EventBus,
    private readonly service: AccountService
  ) {
    super(eventBus, ValidateDepositQuery.name);
  }

  async execute(query: ValidateDepositQuery): Promise<ValidationResponse> {
    this.interceptExecution({
      entities: query.entities,
      amount: query.amount,
    });

    return this.handleQuery(query)
      .then((result) => {
        if (!result.success) {
          this.interceptError(result, result.errorInstance.message);

          return result;
        }

        return this.interceptHandledResult(result);
      })
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
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

  protected async handleQuery(query: ValidateDepositQuery): Promise<ValidationResponse> {
    const allAccounts = await this.service.findAllByProfileId(query.entities.account.profileId);
    const profileFundsAmount = this.getTotalProfileBalance(allAccounts);

    if (profileFundsAmount + query.amount > this.maxProfileFundsAmount) {
      return {
        success: false,
        errorInstance: new ConflictException(
          `Profile funds amount exceeds the limit of ${this.maxProfileFundsAmount} after transaction`
        ),
      };
    }

    try {
      await this.service.getAndValidateAccountForDeposit(
        query.entities.account.id,
        query.amount,
        query.entities.currency.id,
        query.entities.transaction?.id
      );
    } catch (error) {
      return {
        success: false,
        errorInstance: error,
      };
    }

    return { success: true };
  }
}
