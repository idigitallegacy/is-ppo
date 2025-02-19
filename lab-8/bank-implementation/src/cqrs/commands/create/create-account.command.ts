import { Command } from '@nestjs/cqrs';
import { CreateAccountDto } from '../../../api/profiles/dto/account.dto';
import { AccountDTO } from '../../../models/account/account.dto';

export class CreateAccountCommand extends Command<AccountDTO> {
  constructor(public readonly dto: CreateAccountDto) {
    super();
  }
}
