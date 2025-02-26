import { Command } from '@nestjs/cqrs';
import { TransactionDto } from '../../../models/transaction/transaction.dto';

export class OuterTransferMoneySubcommand extends Command<TransactionDto> {
  constructor(public readonly traceId: string) {
    super();
  }
}
