import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from './currency.repository';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async findByTicker(ticker?: string) {
    if (!ticker) {
      return null;
    }

    return this.currencyRepository.findByTicker(ticker);
  }
}
