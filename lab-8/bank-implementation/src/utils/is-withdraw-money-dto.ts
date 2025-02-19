import { WithdrawMoneyDto, withdrawMoneyDtoExample } from '../api/profiles/dto/withdraw-money.dto';

export const isWithdrawMoneyDto = (object: unknown): object is WithdrawMoneyDto => {
  return (
    !!object &&
    Object.keys(withdrawMoneyDtoExample).every((key) => Object.hasOwn(object, key)) &&
    !Object.keys(object).some((key) => !Object.hasOwn(withdrawMoneyDtoExample, key))
  );
};
