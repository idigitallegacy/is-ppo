import { CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DepositMoneyCommand } from './deposit-money.command';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { AccountService } from '../../../models/account/account.service';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { TransactionService } from '../../../models/transaction/transaction.service';

import { v4 as uuidv4 } from 'uuid';
import {
  NormalizedEntities,
  GetNormalizedEntitiesQuery,
} from '../../queries/validators/get-normalized-entities.query';
import { ValidateDepositQuery } from '../../queries/validators/validate-deposit.query';
import { DepositMoneyDto } from '../../../api/profiles/dto/deposit-money.dto';

@CommandHandler(DepositMoneyCommand)
export class DepositMoneyHandler
  extends BaseCommandHandler
  implements ICommandHandler<DepositMoneyCommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly service: AccountService,
    private readonly transactionService: TransactionService
  ) {
    super(eventBus, DepositMoneyCommand.name);
  }

  async execute(command: DepositMoneyCommand): Promise<TransactionDto> {
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
    dto: DepositMoneyDto
  ): Promise<TransactionDto> {
    const validationResponse = await this.queryBus.execute(
      new ValidateDepositQuery(entities, dto.amount)
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

  protected async handleCommand(command: DepositMoneyCommand): Promise<TransactionDto> {
    const normalizedEntities = await this.queryBus.execute(
      new GetNormalizedEntitiesQuery(command.profileId, command.dto, command.transactionId)
    );

    const transaction =
      normalizedEntities.transaction ??
      (await this.createTransaction(normalizedEntities, command.dto));

    await this.transactionService.approveTransaction(transaction.id);

    try {
      await this.service.depositMoney(
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
