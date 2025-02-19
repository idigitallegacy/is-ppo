import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { TransactionService } from '../../../models/transaction/transaction.service';

import { v4 as uuidv4 } from 'uuid';
import { WithdrawMoneyCommand } from '../update/withdraw-money.command';
import { DepositMoneyCommand } from '../update/deposit-money.command';
import { TransactionPurpose } from '../../../models/transaction/transaction.enum';
import {
  GetTransferMoneyEntitiesQuery,
  TransferMoneyEntities,
} from '../../queries/validators/get-transfer-money-entities.query';
import { CommandSequenceInterface } from '../../base/command-sequence.interface';
import { TransferMoneyDto } from '../../../api/accounts/dto/transfer-money.dto';
import { ValidateWithdrawQuery } from '../../queries/validators/validate-withdraw.query';
import { ValidateDepositQuery } from '../../queries/validators/validate-deposit.query';
import { InnerTransferMoneySubcommand } from './inner-transfer-money.subcommand';
import { OuterTransferMoneySubcommand } from './outer-transfer-money.subcommand';

@CommandHandler(InnerTransferMoneySubcommand)
export class InnerTransferMoneyHandler
  extends BaseCommandHandler
  implements ICommandHandler<InnerTransferMoneySubcommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly transactionService: TransactionService
  ) {
    super(eventBus, OuterTransferMoneySubcommand.name);
  }

  async execute(command: InnerTransferMoneySubcommand): Promise<TransactionDto> {
    this.interceptExecution({
      profileId: command.profileId,
      dto: {
        ...command.dto,
      },
    });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  private buildCommandsSequence(
    dto: TransferMoneyDto,
    validEntities: TransferMoneyEntities,
    transaction: TransactionDto
  ): CommandSequenceInterface[] {
    const sequence: CommandSequenceInterface[] = [];
    const basicDto = { amount: dto.amount, currencyTicker: dto.currencyTicker };

    const command1Prepare = new ValidateWithdrawQuery(
      {
        account: validEntities.sourceAccount,
        currency: validEntities.currency,
        transaction,
      },
      dto.amount
    );

    const command1 = new WithdrawMoneyCommand(
      validEntities.sourceAccount.profileId,
      {
        ...basicDto,
        sourceAccountId: dto.sourceAccountId,
      },
      transaction.id
    );

    const command1Rollback = new DepositMoneyCommand(
      validEntities.sourceAccount.profileId,
      {
        ...basicDto,
        destinationAccountId: dto.sourceAccountId,
      },
      transaction.id
    );

    sequence.push({
      prepareQuery: command1Prepare,
      command: command1,
      rollbackCommand: command1Rollback,
      processed: false,
    });

    const command2Prepare = new ValidateDepositQuery(
      {
        account: validEntities.destinationAccount,
        currency: validEntities.currency,
        transaction,
      },
      dto.amount
    );

    const command2 = new DepositMoneyCommand(
      validEntities.destinationAccount.profileId,
      {
        ...basicDto,
        destinationAccountId: dto.destinationAccountId,
      },
      transaction.id
    );

    const command2Rollback = new WithdrawMoneyCommand(
      validEntities.sourceAccount.profileId,
      {
        ...basicDto,
        sourceAccountId: dto.destinationAccountId,
      },
      transaction.id
    );

    sequence.push({
      prepareQuery: command2Prepare,
      command: command2,
      rollbackCommand: command2Rollback,
      processed: false,
    });

    return sequence;
  }

  private async rollbackAndFailTransaction(
    transactionId: string,
    errorMessage: string,
    sequence: CommandSequenceInterface[]
  ) {
    const promises: Promise<any>[] = sequence
      .filter((action) => action.processed)
      .map((action) => this.commandBus.execute(action.rollbackCommand));

    await Promise.allSettled(promises);

    return this.transactionService.failTransaction(transactionId, errorMessage);
  }

  protected async handleCommand(command: InnerTransferMoneySubcommand): Promise<TransactionDto> {
    const validEntities = await this.queryBus.execute(
      new GetTransferMoneyEntitiesQuery(command.profileId, command.dto)
    );

    const transaction = await this.transactionService.create({
      id: uuidv4(),
      currencyId: validEntities.currency.id,
      purpose: TransactionPurpose.INNER_TRANSFER,
      ...command.dto,
    });

    const sequence = this.buildCommandsSequence(command.dto, validEntities, transaction);

    try {
      for (const action of sequence) {
        await this.queryBus.execute(action.prepareQuery);
      }

      for (const action of sequence) {
        await this.commandBus.execute(action.command);
        action.processed = true;
      }

      return await this.transactionService.finishTransaction(transaction.id);
    } catch (error) {
      this.logger.error(error.message);

      for (const action of sequence.filter((seq) => seq.processed).toReversed()) {
        await this.commandBus.execute(action.rollbackCommand);
        action.processed = true;
      }

      return this.rollbackAndFailTransaction(transaction.id, error.message, sequence);
    }
  }
}
