import { EventInterface } from '../base/event.interface';

export class CommandFailedEvent implements EventInterface {
  constructor(
    public readonly commandName: string,
    public readonly payload: any
  ) {}
}
