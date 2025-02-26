import { Command } from '@nestjs/cqrs';
import { AccountDTO } from '../../../models/account/account.dto';

export class DeactivateAccountCommand extends Command<AccountDTO> {
  constructor(public readonly id: string) {
    super();
  }
}
