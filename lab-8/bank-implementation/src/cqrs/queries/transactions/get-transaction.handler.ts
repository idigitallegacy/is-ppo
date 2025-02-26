import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionQuery } from './get-transaction.query';
import { BaseQueryHandler } from '../../base/base-query.handler';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { TransactionService } from '../../../models/transaction/transaction.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetTransactionQuery>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly service: TransactionService
  ) {
    super(eventBus, GetTransactionQuery.name);
  }

  async execute(query: GetTransactionQuery): Promise<TransactionDto | null> {
    this.interceptExecution({ id: query.id });

    return this.handleQuery(query)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleQuery(query: GetTransactionQuery): Promise<TransactionDto | null> {
    const transaction = await this.service.findById(query.id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
