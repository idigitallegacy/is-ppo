import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProfileDto } from './dto/profile.dto';
import { CreateProfileCommand } from '../../cqrs/commands/create/create-profile.command';
import { CreateAccountDto } from './dto/account.dto';
import { CreateAccountCommand } from '../../cqrs/commands/create/create-account.command';
import { DepositMoneyDto } from './dto/deposit-money.dto';
import { DepositMoneyCommand } from '../../cqrs/commands/update/deposit-money.command';
import { WithdrawMoneyDto } from './dto/withdraw-money.dto';
import { WithdrawMoneyCommand } from '../../cqrs/commands/update/withdraw-money.command';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { TransferMoneyCommand } from '../../cqrs/commands/update/transfer-money.command';

@Injectable()
export class ProfilesService {
  constructor(private readonly commandBus: CommandBus) {}

  async create(profile: CreateProfileDto) {
    return this.commandBus.execute(new CreateProfileCommand(profile));
  }

  async createAccount(dto: CreateAccountDto) {
    return this.commandBus.execute(new CreateAccountCommand(dto));
  }

  async withdrawMoney(id: string, dto: WithdrawMoneyDto) {
    return this.commandBus.execute(new WithdrawMoneyCommand(id, dto));
  }

  async depositMoney(id: string, dto: DepositMoneyDto) {
    return this.commandBus.execute(new DepositMoneyCommand(id, dto));
  }

  async transferMoney(dto: TransferMoneyDto) {
    if (dto.sourceProfileId === dto.destinationProfileId) {
      throw new BadRequestException('To transfer money within one account use /accounts/transfer.');
    }

    return this.commandBus.execute(
      new TransferMoneyCommand(dto.sourceProfileId, dto.destinationProfileId, dto)
    );
  }
}
