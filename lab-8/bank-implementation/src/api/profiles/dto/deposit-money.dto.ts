import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class DepositMoneyDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  destinationAccountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.0)
  @Max(1e6)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currencyTicker: string;
}

export const depositMoneyDtoExample: DepositMoneyDto = {
  destinationAccountId: 'uuid',
  amount: 100.0,
  currencyTicker: 'RUB',
};
