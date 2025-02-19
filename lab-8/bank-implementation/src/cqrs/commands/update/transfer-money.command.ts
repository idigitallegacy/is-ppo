import { Command } from '@nestjs/cqrs';
import { TransferMoneyDto } from '../../../api/profiles/dto/transfer-money.dto';
import { TransactionDto } from '../../../models/transaction/transaction.dto';

export class TransferMoneyCommand extends Command<TransactionDto | string> {
  constructor(
    public readonly sourceProfileId: string,
    public readonly destinationProfileId: string,
    public readonly dto: TransferMoneyDto
  ) {
    super();
  }
}
