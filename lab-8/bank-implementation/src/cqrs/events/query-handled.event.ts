import { EventInterface } from '../base/event.interface';

export class QueryHandledEvent implements EventInterface {
  constructor(
    public readonly queryName: string,
    public readonly payload: any
  ) {}
}
