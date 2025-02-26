import { IEvent } from '@nestjs/cqrs';

export interface EventInterface extends IEvent {
  readonly commandName?: string;
  readonly queryName?: string;
  readonly payload?: any;
}
