import { Command } from '@nestjs/cqrs';
import { AccountDTO } from '../../../models/account/account.dto';

export class ActivateAccountCommand extends Command<AccountDTO> {
  constructor(public readonly id: string) {
    super();
  }
}
