import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TransactionModel } from './transaction.model';
import { CreateTransactionDto } from './transaction.dto';
import { TransactionStatus } from './transaction.enum';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(TransactionModel)
    private readonly transactionModel: typeof TransactionModel
  ) {}

  async create(dto: CreateTransactionDto) {
    return this.transactionModel.create({
      ...dto,
    });
  }

  async findById(id: string) {
    return this.transactionModel.findOne({
      where: { id },
    });
  }

  async approve(transaction: TransactionModel) {
    transaction.status = TransactionStatus.APPROVED;

    return transaction.save();
  }

  async finish(transaction: TransactionModel) {
    transaction.status = TransactionStatus.FINISHED;

    return transaction.save();
  }

  async fail(transaction: TransactionModel, errorMessage: string) {
    transaction.status = TransactionStatus.FAILED;
    transaction.failReason = errorMessage;

    return transaction.save();
  }
}
