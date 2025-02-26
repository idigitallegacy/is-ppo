import { Injectable } from '@nestjs/common';
import { ProfileModel } from './profile.model';
import { CreateProfileDto } from './profile.dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(ProfileModel)
    private readonly profileModel: typeof ProfileModel
  ) {}

  async create(dto: CreateProfileDto) {
    return this.profileModel.create({ ...dto });
  }

  async findById(id: string) {
    return this.profileModel.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async findByEmail(email: string) {
    return this.profileModel.findOne({
      where: { email },
      include: { all: true },
    });
  }
}
