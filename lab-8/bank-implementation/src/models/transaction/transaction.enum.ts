export enum TransactionStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}

export enum TransactionPurpose {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  INNER_TRANSFER = 'INNER_TRANSFER',
  EXTERNAL_TRANSFER = 'EXTERNAL_TRANSFER',
}
