import { ICommand, IQuery } from '@nestjs/cqrs';

export interface CommandSequenceInterface {
  prepareQuery: IQuery;
  command: ICommand;
  rollbackCommand: ICommand;
  processed: boolean;
}
