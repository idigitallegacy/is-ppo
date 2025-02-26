import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { AccountDTO, CreateAccountDTO } from './account.dto';
import { TransactionStatus } from '../transaction/transaction.enum';

@Injectable()
export class AccountService {
  private readonly maxBalancePerAccount = 10e6;

  constructor(private readonly accountsRepository: AccountRepository) {}

  async findById(id?: string) {
    if (!id) {
      return null;
    }

    return this.accountsRepository.findById(id);
  }

  async findByIds(ids: string[]) {
    return this.accountsRepository.findByIds(ids);
  }

  async create(dto: CreateAccountDTO) {
    return this.accountsRepository.create(dto);
  }

  async findAllByProfileId(profileId?: string) {
    if (!profileId) {
      return [];
    }

    return this.accountsRepository.findAllByProfileId(profileId);
  }

  async getAndValidateAccountForDeposit(
    accountId: string,
    amount: number,
    currencyId: string,
    txId?: string
  ) {
    if (amount < 0.0) {
      throw new BadRequestException('Amount must be a positive');
    }

    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.currencyId !== currencyId) {
      throw new BadRequestException('Account currency does not match provided currency');
    }

    const pendingIncomeTransactionsAmount = [...account.incomeTransactions]
      .filter(
        (transaction) =>
          transaction.status === TransactionStatus.APPROVED && transaction.id !== txId
      )
      .map((transaction) => transaction.amount)
      .reduce((sum, txAmount) => sum + txAmount, 0.0);

    if (account.balance + pendingIncomeTransactionsAmount + amount > this.maxBalancePerAccount) {
      throw new ConflictException(
        `Deposit leads the limit of ${this.maxBalancePerAccount} to be exceeded`
      );
    }

    return account;
  }

  async getAndValidateAccountForWithdraw(
    accountId: string,
    amount: number,
    currencyId: string,
    txId?: string
  ) {
    if (amount < 0.0) {
      throw new BadRequestException('Amount must be a positive');
    }

    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.currencyId !== currencyId) {
      throw new BadRequestException('Account currency does not match provided currency');
    }

    const pendingExpendedTransactionsAmount = [...account.expendedTransactions]
      .filter(
        (transaction) =>
          transaction.status === TransactionStatus.APPROVED && transaction.id !== txId
      )
      .map((transaction) => transaction.amount)
      .reduce((sum, txAmount) => sum + txAmount, 0.0);

    if (account.balance - pendingExpendedTransactionsAmount - amount < 0.0) {
      throw new ConflictException(`Withdraw leads the account balance to be negative`);
    }

    return account;
  }

  async depositMoney(id: string, txId: string, amount: number, currencyId: string) {
    const account = await this.getAndValidateAccountForDeposit(id, amount, currencyId, txId);

    return this.accountsRepository.updateBalance(account, account.balance + amount);
  }

  async withdrawMoney(id: string, txId: string, amount: number, currencyId: string) {
    const account = await this.getAndValidateAccountForWithdraw(id, amount, currencyId, txId);

    return this.accountsRepository.updateBalance(account, account.balance - amount);
  }

  async deactivate(id: string) {
    const account = await this.accountsRepository.findById(id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.balance > 0.0) {
      throw new ConflictException(`Account balance is ${account.balance} > 0.`);
    }

    return (await this.accountsRepository.setIsActive(account.id, false)) ?? account;
  }

  async activate(id: string) {
    const account = await this.accountsRepository.findById(id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return (await this.accountsRepository.setIsActive(account.id, true)) ?? account;
  }

  async setState(account: AccountDTO) {
    return (await this.accountsRepository.updateState(account)) ?? account;
  }
}
