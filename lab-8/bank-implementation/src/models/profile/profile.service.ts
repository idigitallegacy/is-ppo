import { ConflictException, Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { CreateProfileDto } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async findById(id?: string) {
    if (!id) {
      return null;
    }

    return this.profileRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.profileRepository.findByEmail(email);
  }

  async create(dto: CreateProfileDto) {
    const profile = await this.findByEmail(dto.email);

    if (profile) {
      throw new ConflictException(`Account ${dto.email} already exists`);
    }

    return this.profileRepository.create(dto);
  }
}
