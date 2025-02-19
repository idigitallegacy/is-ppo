import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { CreateTransactionDto, TransactionDto } from './transaction.dto';
import { TransactionPurpose, TransactionStatus } from './transaction.enum';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(dto: CreateTransactionDto): Promise<TransactionDto> {
    if (dto.amount < 0.0) {
      throw new BadRequestException(`Amount must be greater than 0.0`);
    }

    if (!dto.sourceAccountId && !dto.destinationAccountId) {
      throw new BadRequestException(`Source account and destination account cannot be both null`);
    }

    if (!dto.purpose && dto.sourceAccountId && dto.destinationAccountId) {
      throw new BadRequestException(
        `There's purpose required to be explicitly specified to transfer money between two accounts.`
      );
    }

    if (!dto.purpose && dto.destinationAccountId) {
      dto.purpose = TransactionPurpose.DEPOSIT;
    }

    if (!dto.purpose && dto.sourceAccountId) {
      dto.purpose = TransactionPurpose.WITHDRAW;
    }

    return this.transactionRepository.create(dto);
  }

  async findById(id?: string): Promise<TransactionDto | null> {
    if (!id) {
      return null;
    }

    return this.transactionRepository.findById(id);
  }

  async approveTransaction(id: string): Promise<TransactionDto> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (
      transaction.status !== TransactionStatus.NEW &&
      transaction.status !== TransactionStatus.APPROVED
    ) {
      throw new ConflictException('Transaction is not new/approved');
    }

    return this.transactionRepository.approve(transaction);
  }

  async finishTransaction(id: string) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.APPROVED) {
      throw new ConflictException('Transaction is not approved');
    }

    return this.transactionRepository.finish(transaction);
  }

  async failTransaction(id: string, errorMessage: string) {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.FINISHED) {
      throw new ConflictException('Transaction is already finished');
    }

    return this.transactionRepository.fail(
      transaction,
      transaction.failReason
        ? `${transaction.failReason} ${errorMessage}`.trim()
        : errorMessage.trim()
    );
  }
}
