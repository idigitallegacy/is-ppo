import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { TransferMoneyDto, transferMoneyDtoExample } from './dto/transfer-money.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';

@Controller()
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @ApiOperation({
    summary: 'Get account data',
  })
  @Get(':id')
  async getAccount(@Param('id') id: string) {
    return this.service.getAccountById(id);
  }

  @ApiOperation({
    summary: 'Make an internal (within one profile) transfer',
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
    return this.service.transferMoney(dto);
  }

  @ApiOperation({
    summary: 'Deactivate account',
  })
  @Put('/deactivate/:id')
  async deactivateAccount(@Param('id') id: string) {
    return this.service.deactivateAccount(id);
  }

  @ApiOperation({
    summary: 'Deactivate account',
  })
  @Put('/activate/:id')
  async activateAccount(@Param('id') id: string) {
    return this.service.activateAccount(id);
  }
}
