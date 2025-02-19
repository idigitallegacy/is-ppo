import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CurrencyModel } from './currency.model';

@Injectable()
export class CurrencyRepository {
  constructor(
    @InjectModel(CurrencyModel)
    private readonly currencyModel: typeof CurrencyModel
  ) {}

  async findByTicker(ticker: string) {
    return this.currencyModel.findOne({
      where: { ticker },
    });
  }
}
