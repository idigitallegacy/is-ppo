import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountService } from '../../../models/account/account.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AccountDTO } from '../../../models/account/account.dto';
import { CurrencyService } from '../../../models/currency/currency.service';
import { NormalizedEntities, GetNormalizedEntitiesQuery } from './get-normalized-entities.query';
import { isDepositMoneyDto } from '../../../utils/is-deposit-money-dto';
import { isWithdrawMoneyDto } from '../../../utils/is-withdraw-money-dto';
import { DepositMoneyDto } from '../../../api/profiles/dto/deposit-money.dto';
import { WithdrawMoneyDto } from '../../../api/profiles/dto/withdraw-money.dto';
import { TransactionService } from '../../../models/transaction/transaction.service';
import { BaseQueryHandler } from '../../base/base-query.handler';

@QueryHandler(GetNormalizedEntitiesQuery)
export class GetNormalizedEntitiesHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetNormalizedEntitiesQuery>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly accountService: AccountService,
    private readonly currencyService: CurrencyService,
    private readonly transactionService: TransactionService
  ) {
    super(eventBus, GetNormalizedEntitiesQuery.name);
  }

  async execute(query: GetNormalizedEntitiesQuery): Promise<NormalizedEntities> {
    this.interceptExecution({
      profileId: query.profileId,
      transactionId: query.transactionId,
      dto: query.dto,
    });

    return this.handleQuery(query)
      .then((result) => this.interceptHandledResult(result))
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  private async getAccountByDepositDto(dto: DepositMoneyDto): Promise<AccountDTO> {
    const account = await this.accountService.findById(dto.destinationAccountId);

    if (!account) {
      throw new BadRequestException(`Destination account doesn't exist.`);
    }

    if (!account.isActive) {
      throw new ConflictException(`Account is not active.`);
    }

    return account;
  }

  private async getAccountByWithdrawDto(dto: WithdrawMoneyDto): Promise<AccountDTO> {
    const account = await this.accountService.findById(dto.sourceAccountId);

    if (!account) {
      throw new BadRequestException(`Source account doesn't exist.`);
    }

    if (!account.isActive) {
      throw new ConflictException(`Account is not active.`);
    }

    return account;
  }

  protected async handleQuery(query: GetNormalizedEntitiesQuery): Promise<NormalizedEntities> {
    let account: AccountDTO | null = null;

    if (isDepositMoneyDto(query.dto)) {
      account = await this.getAccountByDepositDto(query.dto);
    }

    if (isWithdrawMoneyDto(query.dto)) {
      account = await this.getAccountByWithdrawDto(query.dto);
    }

    if (!account) {
      throw new BadRequestException(`Account doesn't exist.`);
    }

    const currency = await this.currencyService.findByTicker(query.dto.currencyTicker);

    if (!currency) {
      throw new BadRequestException(`Currency ${query.dto.currencyTicker} not found.`);
    }

    if (account.profileId !== query.profileId) {
      throw new ConflictException(`Destination account doesn't match requested profile.`);
    }

    const transaction = await this.transactionService.findById(query.transactionId);

    return {
      account,
      currency,
      transaction: transaction ?? undefined,
    };
  }
}
