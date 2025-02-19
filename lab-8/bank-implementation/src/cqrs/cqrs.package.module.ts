import { Module } from '@nestjs/common';
import { CqrsCommandsModule } from './commands/cqrs.commands.module';
import { CqrsQueriesModule } from './queries/cqrs.queries.module';
import { CqrsEventsModule } from './events/cqrs.events.module';

@Module({
  imports: [CqrsCommandsModule, CqrsQueriesModule, CqrsEventsModule],
})
export class CqrsPackageModule {}
