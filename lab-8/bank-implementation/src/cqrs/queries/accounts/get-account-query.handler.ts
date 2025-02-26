import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAccountQuery } from './get-account.query';
import { AccountService } from '../../../models/account/account.service';
import { NotFoundException } from '@nestjs/common';
import { AccountDTO } from '../../../models/account/account.dto';
import { BaseQueryHandler } from '../../base/base-query.handler';

@QueryHandler(GetAccountQuery)
export class GetAccountQueryHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetAccountQuery>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly service: AccountService
  ) {
    super(eventBus, GetAccountQuery.name);
  }

  async execute(query: GetAccountQuery): Promise<AccountDTO> {
    this.interceptExecution({ id: query.id });

    return this.handleQuery(query)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleQuery(query: GetAccountQuery): Promise<AccountDTO> {
    const account = await this.service.findById(query.id);

    if (!account) {
      throw new NotFoundException(`Account ${query.id} not found`);
    }

    return account;
  }
}
