import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountService } from '../../../models/account/account.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  GetTransferMoneyEntitiesQuery,
  TransferMoneyEntities,
} from './get-transfer-money-entities.query';
import { CurrencyService } from '../../../models/currency/currency.service';
import { BaseQueryHandler } from '../../base/base-query.handler';

@QueryHandler(GetTransferMoneyEntitiesQuery)
export class GetTransferMoneyEntitiesHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetTransferMoneyEntitiesQuery>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly accountService: AccountService,
    private readonly currencyService: CurrencyService
  ) {
    super(eventBus, GetTransferMoneyEntitiesQuery.name);
  }

  async execute(query: GetTransferMoneyEntitiesQuery): Promise<TransferMoneyEntities> {
    this.interceptExecution({
      profileId: query.profileId,
      transactionId: query.transactionId,
      dto: query.dto,
    });

    return this.handleQuery(query)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleQuery(
    query: GetTransferMoneyEntitiesQuery
  ): Promise<TransferMoneyEntities> {
    const sourceAccount = await this.accountService.findById(query.dto.sourceAccountId);
    const destinationAccount = await this.accountService.findById(query.dto.destinationAccountId);
    const currency = await this.currencyService.findByTicker(query.dto.currencyTicker);

    if (!sourceAccount || !destinationAccount) {
      throw new BadRequestException(`Source or destination accounts doesn't exist.`);
    }

    if (!currency) {
      throw new BadRequestException(`Currency ${query.dto.currencyTicker} not found.`);
    }

    if (
      sourceAccount.profileId !== query.profileId ||
      destinationAccount.profileId !== query.profileId
    ) {
      throw new ConflictException(`Source/destination account doesn't match requested profile.`);
    }

    return {
      sourceAccount,
      destinationAccount,
      currency,
    };
  }
}
