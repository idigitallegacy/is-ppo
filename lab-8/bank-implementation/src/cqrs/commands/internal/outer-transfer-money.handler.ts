import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { TransactionService } from '../../../models/transaction/transaction.service';

import { OuterTransferMoneySubcommand } from './outer-transfer-money.subcommand';
import { AccountService } from '../../../models/account/account.service';

@CommandHandler(OuterTransferMoneySubcommand)
export class OuterTransferMoneyHandler
  extends BaseCommandHandler
  implements ICommandHandler<OuterTransferMoneySubcommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService
  ) {
    super(eventBus, OuterTransferMoneySubcommand.name);
  }

  async execute(command: OuterTransferMoneySubcommand): Promise<TransactionDto> {
    this.interceptExecution({
      traceId: command.traceId,
    });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(command: OuterTransferMoneySubcommand): Promise<TransactionDto> {
    const transaction = await this.transactionService.findById(command.traceId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const promises = [
      this.accountService.withdrawMoney(
        transaction.sourceAccountId,
        command.traceId,
        transaction.amount,
        transaction.currencyId
      ),
      this.accountService.depositMoney(
        transaction.destinationAccountId,
        command.traceId,
        transaction.amount,
        transaction.currencyId
      ),
      this.transactionService.finishTransaction(transaction.id),
    ];

    try {
      await Promise.all(promises);

      return (await this.transactionService.findById(transaction.id)) ?? transaction;
    } catch (error) {
      return this.transactionService.failTransaction(transaction.id, error.message);
    }
  }
}
