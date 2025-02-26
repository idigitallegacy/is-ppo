import { Query } from '@nestjs/cqrs';
import { AccountDTO } from '../../../models/account/account.dto';
import { CurrencyDto } from '../../../models/currency/currency.dto';
import { DepositMoneyDto } from '../../../api/profiles/dto/deposit-money.dto';
import { WithdrawMoneyDto } from '../../../api/profiles/dto/withdraw-money.dto';
import { TransactionDto } from '../../../models/transaction/transaction.dto';

export interface NormalizedEntities {
  account: AccountDTO;
  currency: CurrencyDto;
  transaction?: TransactionDto;
}

export class GetNormalizedEntitiesQuery extends Query<NormalizedEntities> {
  constructor(
    public readonly profileId: string,
    public readonly dto: DepositMoneyDto | WithdrawMoneyDto,
    public readonly transactionId?: string
  ) {
    super();
  }
}
