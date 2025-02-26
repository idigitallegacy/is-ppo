import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currencyTicker: string;
}

export const createAccountDtoExample: CreateAccountDto = {
  profileId: 'uuid',
  currencyTicker: 'RUB',
};
