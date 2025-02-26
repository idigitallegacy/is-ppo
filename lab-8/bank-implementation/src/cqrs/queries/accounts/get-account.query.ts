import { Query } from '@nestjs/cqrs';
import { AccountDTO } from '../../../models/account/account.dto';

export class GetAccountQuery extends Query<AccountDTO> {
  constructor(public readonly id: string) {
    super();
  }
}
