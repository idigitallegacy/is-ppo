import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class TransferMoneyDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  sourceProfileId: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  destinationProfileId: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  destinationAccountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.0)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currencyTicker: string;
}

export const transferMoneyDtoExample: TransferMoneyDto = {
  sourceProfileId: 'uuid',
  destinationProfileId: 'uuid',
  sourceAccountId: 'uuid',
  destinationAccountId: 'uuid',
  amount: 0.0,
  currencyTicker: 'RUB',
};
