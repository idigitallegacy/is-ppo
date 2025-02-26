import { Controller, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @ApiOperation({
    summary: 'Get Transaction',
  })
  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
