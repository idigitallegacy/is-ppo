import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountModel } from './account.model';
import { AccountDTO, CreateAccountDTO } from './account.dto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(AccountModel)
    private readonly accountModel: typeof AccountModel
  ) {}

  async findById(id: string) {
    return this.accountModel.findOne({
      where: { id },
      include: { all: true },
    });
  }

  async findByIds(ids: string[]) {
    return this.accountModel.findAll({
      where: { id: ids },
      include: { all: true },
    });
  }

  async create(dto: CreateAccountDTO): Promise<AccountModel> {
    return this.accountModel.create({
      ...dto,
    });
  }

  async findAllByProfileId(profileId: string) {
    return this.accountModel.findAll({
      where: { profileId },
      include: { all: true },
    });
  }

  async updateBalance(account: AccountModel, balance: number) {
    account.balance = balance;

    return account.save();
  }

  async updateState(account: AccountDTO) {
    await this.accountModel.update(
      {
        ...account,
      },
      {
        where: {
          id: account.id,
        },
      }
    );

    return this.accountModel.findOne({
      where: {
        id: account.id,
      },
    });
  }

  async setIsActive(id: string, isActive: boolean) {
    await this.accountModel.update(
      {
        isActive,
      },
      { where: { id } }
    );

    return this.accountModel.findOne({
      where: {
        id,
      },
    });
  }
}
