import { Command } from '@nestjs/cqrs';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { DepositMoneyDto } from '../../../api/profiles/dto/deposit-money.dto';

export class DepositMoneyCommand extends Command<TransactionDto> {
  constructor(
    public readonly profileId: string,
    public readonly dto: DepositMoneyDto,
    public readonly transactionId?: string
  ) {
    super();
  }
}
