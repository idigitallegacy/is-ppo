import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateAccountCommand } from './create-account.command';
import { BaseCommandHandler } from '../../base/base-command.handler';
import { AccountService } from '../../../models/account/account.service';
import { v4 as uuidv4 } from 'uuid';
import { AccountDTO } from '../../../models/account/account.dto';
import { CurrencyService } from '../../../models/currency/currency.service';
import { ProfileService } from '../../../models/profile/profile.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  private readonly maxAccountsPerProfile = 5;

  constructor(
    protected readonly eventBus: EventBus,
    private readonly currencyService: CurrencyService,
    private readonly profileService: ProfileService,
    private readonly service: AccountService
  ) {
    super(eventBus, CreateAccountCommand.name);
  }

  async execute(command: CreateAccountCommand): Promise<AccountDTO> {
    this.interceptExecution({ ...command.dto });

    return this.handleCommand(command)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleCommand(command: CreateAccountCommand): Promise<AccountDTO> {
    const { dto } = command;
    this.logger.log(`Handling with dto: ${JSON.stringify(dto)}`);

    const profile = await this.profileService.findById(dto.profileId);
    const currency = await this.currencyService.findByTicker(dto.currencyTicker);

    if (!profile) {
      throw new BadRequestException(`Profile doesn't exist`);
    }

    if (!currency) {
      throw new BadRequestException(`Currency doesn't exist`);
    }

    if (
      profile.accounts?.filter((account) => account.isActive)?.length >= this.maxAccountsPerProfile
    ) {
      throw new ConflictException(
        `Profile already has ${this.maxAccountsPerProfile} active accounts`
      );
    }

    return this.service.create({ id: uuidv4(), currencyId: currency.id, ...dto });
  }
}
