import { DepositMoneyDto, depositMoneyDtoExample } from '../api/profiles/dto/deposit-money.dto';

export const isDepositMoneyDto = (object: unknown): object is DepositMoneyDto => {
  return (
    !!object &&
    Object.keys(depositMoneyDtoExample).every((key) => Object.hasOwn(object, key)) &&
    !Object.keys(object).some((key) => !Object.hasOwn(depositMoneyDtoExample, key))
  );
};
