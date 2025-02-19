import { EventInterface } from '../base/event.interface';

export class CommandHandledEvent implements EventInterface {
  constructor(
    public readonly commandName: string,
    public readonly payload: any
  ) {}
}
