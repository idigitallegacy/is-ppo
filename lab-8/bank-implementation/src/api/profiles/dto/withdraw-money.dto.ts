import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class WithdrawMoneyDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string;

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

export const withdrawMoneyDtoExample: WithdrawMoneyDto = {
  sourceAccountId: 'uuid',
  amount: 100.0,
  currencyTicker: 'RUB',
};
