import { Module } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfileModel } from './profile.model';
import { ProfileService } from './profile.service';

@Module({
  imports: [SequelizeModule.forFeature([ProfileModel])],
  providers: [ProfileRepository, ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
