import { TransferMoneyDto } from './dto/transfer-money.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAccountQuery } from '../../cqrs/queries/accounts/get-account.query';
import { TransferMoneyCommand } from '../../cqrs/commands/update/transfer-money.command';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DeactivateAccountCommand } from '../../cqrs/commands/update/deactivate-account.command';
import { ActivateAccountCommand } from '../../cqrs/commands/update/activate-account.command';

@Injectable()
export class AccountsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async getAccountById(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    return this.queryBus.execute(new GetAccountQuery(id));
  }

  async transferMoney(dto: TransferMoneyDto) {
    return this.commandBus.execute(
      new TransferMoneyCommand(dto.profileId, dto.profileId, {
        ...dto,
        sourceProfileId: dto.profileId,
        destinationProfileId: dto.profileId,
      })
    );
  }

  async deactivateAccount(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    return this.commandBus.execute(new DeactivateAccountCommand(id));
  }

  async activateAccount(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    return this.commandBus.execute(new ActivateAccountCommand(id));
  }
}
