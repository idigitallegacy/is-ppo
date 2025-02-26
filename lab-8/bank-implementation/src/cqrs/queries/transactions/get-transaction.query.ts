import { Query } from '@nestjs/cqrs';
import { TransactionDto } from '../../../models/transaction/transaction.dto';

export class GetTransactionQuery extends Query<TransactionDto | null> {
  constructor(public readonly id: string) {
    super();
  }
}