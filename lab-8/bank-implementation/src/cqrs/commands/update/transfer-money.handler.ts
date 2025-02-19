import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { TransferMoneyCommand } from './transfer-money.command';
import { InnerTransferMoneySubcommand } from '../internal/inner-transfer-money.subcommand';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { TransactionDto } from '../../../models/transaction/transaction.dto';
import { TransferMoneySagaTrigger } from '../../events/internal/transfer-money.saga.trigger';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(TransferMoneyCommand)
export class TransferMoneyHandler
  extends BaseCommandHandler
  implements ICommandHandler<TransferMoneyCommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly commandBus: CommandBus
  ) {
    super(eventBus, TransferMoneyCommand.name);
  }

  async execute(command: TransferMoneyCommand): Promise<TransactionDto | string> {
    this.interceptExecution({
      sourceProfileId: command.sourceProfileId,
      destinationProfileId: command.destinationProfileId,
      dto: {
        ...command.dto,
      },
    });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(command: TransferMoneyCommand): Promise<TransactionDto | string> {
    if (command.sourceProfileId === command.destinationProfileId) {
      return this.commandBus.execute(
        new InnerTransferMoneySubcommand(command.sourceProfileId, {
          ...command.dto,
          profileId: command.sourceProfileId,
        })
      );
    }

    const traceId = uuidv4();
    await this.eventBus.publish(new TransferMoneySagaTrigger({ ...command, traceId }));

    return traceId;
  }
}
