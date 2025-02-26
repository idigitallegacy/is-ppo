import { Command } from '@nestjs/cqrs';
import { TransferMoneyDto } from '../../../api/accounts/dto/transfer-money.dto';
import { TransactionDto } from '../../../models/transaction/transaction.dto';

export class InnerTransferMoneySubcommand extends Command<TransactionDto> {
  constructor(
    public readonly profileId: string,
    public readonly dto: TransferMoneyDto
  ) {
    super();
  }
}
