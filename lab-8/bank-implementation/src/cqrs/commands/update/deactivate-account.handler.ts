import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { AccountService } from '../../../models/account/account.service';
import { DeactivateAccountCommand } from './deactivate-account.command';
import { AccountDTO } from '../../../models/account/account.dto';

@CommandHandler(DeactivateAccountCommand)
export class DeactivateAccountHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeactivateAccountCommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly accountService: AccountService
  ) {
    super(eventBus, DeactivateAccountCommand.name);
  }

  async execute(command: DeactivateAccountCommand): Promise<AccountDTO> {
    this.interceptExecution({
      id: command.id,
    });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(command: DeactivateAccountCommand): Promise<AccountDTO> {
    return this.accountService.deactivate(command.id);
  }
}
