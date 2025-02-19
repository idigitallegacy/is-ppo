import { Logger } from '@nestjs/common';
import { EventBus, ICommand } from '@nestjs/cqrs';
import { CommandHandledEvent } from '../events/command-handled.event';
import { CommandFailedEvent } from '../events/command-failed.event';

export abstract class BaseCommandHandler {
  protected readonly logger: Logger;

  protected constructor(
    protected readonly eventBus: EventBus,
    private readonly commandName = 'UnknownCommand'
  ) {
    this.logger = new Logger(this.commandName);
  }

  protected abstract handleCommand(command: ICommand): any;

  protected interceptExecution(payload: Record<string, unknown>): void {
    this.logger.log(`[cmd:${this.commandName}] Received with payload ${JSON.stringify(payload)}`);
  }

  protected interceptHandledResult<T>(result: T): T {
    this.logger.log(`[cmd:${this.commandName}] Handled`);

    this.eventBus.publish(new CommandHandledEvent(this.commandName, result));

    return result;
  }

  protected interceptError<T>(error: T, message = ''): T {
    this.logger.error(`[cmd:${this.commandName}] Error: ${message}`);

    this.eventBus.publish(new CommandFailedEvent(this.commandName, error));

    return error;
  }
}
