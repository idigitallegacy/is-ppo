import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { AccountService } from '../../../models/account/account.service';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { CurrencyService } from '../../../models/currency/currency.service';
import { TransactionService } from '../../../models/transaction/transaction.service';

import { v4 as uuidv4 } from 'uuid';
import { WithdrawMoneyCommand } from './withdraw-money.command';
import {
  GetNormalizedEntitiesQuery,
  NormalizedEntities,
} from '../../queries/validators/get-normalized-entities.query';
import { ValidateWithdrawQuery } from '../../queries/validators/validate-withdraw.query';
import { WithdrawMoneyDto } from '../../../api/profiles/dto/withdraw-money.dto';

@CommandHandler(WithdrawMoneyCommand)
export class WithdrawMoneyHandler
  extends BaseCommandHandler
  implements ICommandHandler<WithdrawMoneyCommand>
{
  private readonly maxProfileFundsAmount = 25e6;

  constructor(
    protected readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly service: AccountService,
    private readonly currencyService: CurrencyService,
    private readonly transactionService: TransactionService
  ) {
    super(eventBus, WithdrawMoneyCommand.name);
  }

  async execute(command: WithdrawMoneyCommand): Promise<TransactionDto> {
    this.interceptExecution({
      profileId: command.profileId,
      transactionId: command.transactionId,
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

  private async createTransaction(
    entities: NormalizedEntities,
    dto: WithdrawMoneyDto
  ): Promise<TransactionDto> {
    const validationResponse = await this.queryBus.execute(
      new ValidateWithdrawQuery(entities, dto.amount)
    );

    if (!validationResponse.success) {
      this.logger.error(validationResponse.errorInstance.message);

      throw validationResponse.errorInstance;
    }

    return this.transactionService.create({
      id: uuidv4(),
      currencyId: entities.currency.id,
      ...dto,
    });
  }

  protected async handleCommand(command: WithdrawMoneyCommand): Promise<TransactionDto> {
    const normalizedEntities = await this.queryBus.execute(
      new GetNormalizedEntitiesQuery(command.profileId, command.dto, command.transactionId)
    );

    const transaction =
      normalizedEntities.transaction ??
      (await this.createTransaction(normalizedEntities, command.dto));

    await this.transactionService.approveTransaction(transaction.id);

    try {
      await this.service.withdrawMoney(
        normalizedEntities.account.id,
        transaction.id,
        command.dto.amount,
        normalizedEntities.currency.id
      );

      return (
        normalizedEntities.transaction ??
        (await this.transactionService.finishTransaction(transaction.id))
      );
    } catch (error) {
      if (normalizedEntities.transaction) {
        throw error;
      }

      this.logger.error(error.message);

      return await this.transactionService.failTransaction(transaction.id, error.message);
    }
  }
}
