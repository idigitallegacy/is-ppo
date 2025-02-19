import { Command } from '@nestjs/cqrs';
import { CreateProfileDto } from '../../../api/profiles/dto/profile.dto';
import { ProfileDto } from '../../../models/profile/profile.dto';

export class CreateProfileCommand extends Command<ProfileDto> {
  constructor(public readonly dto: CreateProfileDto) {
    super();
  }
}
