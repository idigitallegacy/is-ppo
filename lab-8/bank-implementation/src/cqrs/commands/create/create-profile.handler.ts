import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateProfileCommand } from './create-profile.command';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { v4 as uuidv4 } from 'uuid';
import { ProfileService } from '../../../models/profile/profile.service';
import { ProfileDto } from '../../../models/profile/profile.dto';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateProfileCommand>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly service: ProfileService
  ) {
    super(eventBus, CreateProfileCommand.name);
  }

  async execute(command: CreateProfileCommand): Promise<ProfileDto> {
    this.interceptExecution({ ...command.dto });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected handleCommand(command: CreateProfileCommand): Promise<ProfileDto> {
    return this.service.create({ id: uuidv4(), ...command.dto });
  }
}
