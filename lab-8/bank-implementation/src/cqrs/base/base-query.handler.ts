import { Logger } from '@nestjs/common';
import { EventBus, ICommand } from '@nestjs/cqrs';
import { QueryHandledEvent } from '../events/query-handled.event';
import { QueryFailedEvent } from '../events/query-failed.event';

export abstract class BaseQueryHandler {
  protected readonly logger: Logger;

  protected constructor(
    protected readonly eventBus: EventBus,
    private readonly queryName = 'UnknownQuery'
  ) {
    this.logger = new Logger(this.queryName);
  }

  protected abstract handleQuery(query: ICommand): any;

  protected interceptExecution(payload: Record<string, unknown>): void {
    this.logger.log(`[query:${this.queryName}] Received with payload ${JSON.stringify(payload)}`);
  }

  protected interceptHandledResult<T>(result: T): T {
    this.logger.log(`[query:${this.queryName}] Handled`);

    this.eventBus.publish(new QueryHandledEvent(this.queryName, result));

    return result;
  }

  protected interceptError<T>(error: T, message = ''): T {
    this.logger.error(`[query:${this.queryName}] Error: ${message}`);

    this.eventBus.publish(new QueryFailedEvent(this.queryName, error));

    return error;
  }
}
