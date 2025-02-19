import { Command } from '@nestjs/cqrs';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { WithdrawMoneyDto } from '../../../api/profiles/dto/withdraw-money.dto';

export class WithdrawMoneyCommand extends Command<TransactionDto> {
  constructor(
    public readonly profileId: string,
    public readonly dto: WithdrawMoneyDto,
    public readonly transactionId?: string
  ) {
    super();
  }
}
