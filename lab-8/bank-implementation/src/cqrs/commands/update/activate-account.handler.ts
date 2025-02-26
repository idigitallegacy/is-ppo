import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { AccountService } from '../../../models/account/account.service';
import { AccountDTO } from '../../../models/account/account.dto';
import { ActivateAccountCommand } from './activate-account.command';

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler
  extends BaseCommandHandler
  implements ICommandHandler<ActivateAccountCommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly accountService: AccountService
  ) {
    super(eventBus, ActivateAccountCommand.name);
  }

  async execute(command: ActivateAccountCommand): Promise<AccountDTO> {
    this.interceptExecution({
      id: command.id,
    });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(command: ActivateAccountCommand): Promise<AccountDTO> {
    return this.accountService.activate(command.id);
  }
}
