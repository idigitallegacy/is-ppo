import { Command } from '@nestjs/cqrs';

export class VerifyTransactionSubcommand extends Command<{ traceId: string }> {
  constructor(public readonly traceId: string) {
    super();
  }
}
