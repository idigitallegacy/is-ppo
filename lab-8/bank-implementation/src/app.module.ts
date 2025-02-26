import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { ModelsModule } from './models/models.module';
import { CqrsPackageModule } from './cqrs/cqrs.package.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ModelsModule,

    ApiModule,
    CqrsModule.forRoot(),
    CqrsPackageModule,
  ],
})
export class AppModule {}
