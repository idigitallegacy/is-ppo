import { Query } from '@nestjs/cqrs';
import { AccountDTO } from '../../../models/account/account.dto';
import { TransferMoneyDto } from '../../../api/accounts/dto/transfer-money.dto';
import { CurrencyDto } from '../../../models/currency/currency.dto';

export interface TransferMoneyEntities {
  sourceAccount: AccountDTO;
  destinationAccount: AccountDTO;
  currency: CurrencyDto;
}

export class GetTransferMoneyEntitiesQuery extends Query<TransferMoneyEntities> {
  constructor(
    public readonly profileId: string,
    public readonly dto: TransferMoneyDto,
    public readonly transactionId?: string
  ) {
    super();
  }
}
