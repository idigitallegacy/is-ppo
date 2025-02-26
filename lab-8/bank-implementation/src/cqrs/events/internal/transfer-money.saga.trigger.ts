import { EventInterface } from '../../base/event.interface';

export class TransferMoneySagaTrigger implements EventInterface {
  constructor(
    public readonly payload?: any,
    public readonly commandName = TransferMoneySagaTrigger.name
  ) {}
}
