import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateProfileDto, createProfileDtoExample } from './dto/profile.dto';
import { ProfilesService } from './profiles.service';
import { CreateAccountDto, createAccountDtoExample } from './dto/account.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { DepositMoneyDto, depositMoneyDtoExample } from './dto/deposit-money.dto';
import { WithdrawMoneyDto, withdrawMoneyDtoExample } from './dto/withdraw-money.dto';
import { TransferMoneyDto, transferMoneyDtoExample } from './dto/transfer-money.dto';

@Controller()
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @ApiOperation({
    summary: 'Create profile',
  })
  @ApiBody({
    type: CreateProfileDto,
    examples: {
      default: {
        summary: 'Default value',
        value: createProfileDtoExample,
      },
    },
  })
  @Post()
  async create(@Body() profile: CreateProfileDto) {
    return this.profilesService.create(profile);
  }

  @ApiOperation({
    summary: 'Create account',
  })
  @ApiBody({
    type: CreateAccountDto,
    examples: {
      default: {
        summary: 'Default value',
        value: createAccountDtoExample,
      },
    },
  })
  @Post('/account')
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.profilesService.createAccount(dto);
  }

  @ApiOperation({
    summary: 'Deposit money to account',
  })
  @ApiBody({
    type: DepositMoneyDto,
    examples: {
      default: {
        summary: 'Default value',
        value: depositMoneyDtoExample,
      },
    },
  })
  @Put('/:id/deposit')
  async depositMoney(@Param('id') id: string, @Body() dto: DepositMoneyDto) {
    return this.profilesService.depositMoney(id, dto);
  }

  @ApiOperation({
    summary: 'Withdraw money from account',
  })
  @ApiBody({
    type: WithdrawMoneyDto,
    examples: {
      default: {
        summary: 'Default value',
        value: withdrawMoneyDtoExample,
      },
    },
  })
  @Put('/:id/withdraw')
  async withdrawMoney(@Param('id') id: string, @Body() dto: WithdrawMoneyDto) {
    return this.profilesService.withdrawMoney(id, dto);
  }

  @ApiOperation({
    summary: 'Make an external (within two profiles) transfer',
  })
  @ApiBody({
    type: TransferMoneyDto,
    examples: {
      default: {
        summary: 'Default value',
        value: transferMoneyDtoExample,
      },
    },
  })
  @Put('transfer')
  async transferMoney(@Body() dto: TransferMoneyDto) {
    return this.profilesService.transferMoney(dto);
  }
}
