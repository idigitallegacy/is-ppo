export interface CreateAccountDTO {
  id: string;
  profileId: string;
  currencyId: string;
}

export interface AccountDTO {
  id: string;
  profileId: string;
  balance: number;
  currencyId: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
