import { TransactionPurpose, TransactionStatus } from './transaction.enum';

export interface CreateTransactionDto {
  id: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  purpose?: TransactionPurpose;
  amount: number;
  currencyId: string;
}

export interface TransactionDto {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  purpose: TransactionPurpose;
  amount: number;
  currencyId: string;
  status: TransactionStatus;
  failReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
