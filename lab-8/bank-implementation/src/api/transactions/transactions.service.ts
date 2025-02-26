import { BadRequestException, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { isUUID } from 'class-validator';
import { GetTransactionQuery } from '../../cqrs/queries/transactions/get-transaction.query';

@Injectable()
export class TransactionsService {
  constructor(private readonly queryBus: QueryBus) {}

  async getById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    return this.queryBus.execute(new GetTransactionQuery(id));
  }
}
