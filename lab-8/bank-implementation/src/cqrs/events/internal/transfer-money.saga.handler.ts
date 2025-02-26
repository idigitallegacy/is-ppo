import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, QueryBus, Saga } from '@nestjs/cqrs';
import { asyncScheduler, mergeMap, Observable, Subject } from 'rxjs';
import { EventInterface } from '../../base/event.interface';
import { TransferMoneySagaTrigger } from './transfer-money.saga.trigger';
import {
  TransactionPurpose,
  TransactionStatus,
} from '../../../models/transaction/transaction.enum';
import { TransactionService } from '../../../models/transaction/transaction.service';
import { VerifyTransactionSubcommand } from '../../commands/internal/verify-transaction.subcommand';
import { OuterTransferMoneySubcommand } from '../../commands/internal/outer-transfer-money.subcommand';
import { AccountDTO } from '../../../models/account/account.dto';
import { AccountService } from '../../../models/account/account.service';
import { GetNormalizedEntitiesQuery } from '../../queries/validators/get-normalized-entities.query';
import { DepositMoneyDto } from '../../../api/profiles/dto/deposit-money.dto';
import { WithdrawMoneyDto } from '../../../api/profiles/dto/withdraw-money.dto';

@Injectable()
export class TransferMoneySagaHandler {
  private readonly logger = new Logger(TransferMoneySagaHandler.name);
  private destroy$ = new Subject<void>();

  private transferMoneySagaTraceback: {
    traceId: string;
    initialState: {
      sourceAccount: AccountDTO;
      destinationAccount: AccountDTO;
    };
  }[] = [];

  constructor(
    private readonly queryBus: QueryBus,
    private readonly transactionService: TransactionService,
    private readonly accountService: AccountService
  ) {}

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Saga()
  transferMoneyRequest = (event$: Observable<any>) => {
    return event$.pipe(
      mergeMap(async (event) => {
        const command = await this.handleEvent(event);
        asyncScheduler.schedule(() => command);
        return command;
      })
    );
  };

  private async handleEvent(event: EventInterface): Promise<ICommand | IEvent | null> {
    switch (event.commandName) {
      case TransferMoneySagaTrigger.name: {
        return this.handleTransferMoneySagaTrigger(event);
      }

      case VerifyTransactionSubcommand.name: {
        return this.handleVerifyTransactionSubcommand(event);
      }

      case OuterTransferMoneySubcommand.name: {
        return this.handleOuterTransferMoneySubcommand(event);
      }
    }

    return null;
  }

  private async getContextByTraceId(traceId?: string) {
    if (!traceId) {
      return null;
    }

    const tracebackData = this.transferMoneySagaTraceback.find(
      (traceback) => traceback.traceId === traceId
    );
    const transaction = await this.transactionService.findById(tracebackData?.traceId);
    const sourceAccount = await this.accountService.findById(transaction?.sourceAccountId);
    const destinationAccount = await this.accountService.findById(
      transaction?.destinationAccountId
    );

    if (!tracebackData || !transaction || !sourceAccount || !destinationAccount) {
      return null;
    }

    return {
      data: tracebackData,
      transaction,
      sourceAccount,
      destinationAccount,
    };
  }

  private async handleTransferMoneySagaTrigger(event: EventInterface): Promise<ICommand | null> {
    let depositValidEntities;
    let withdrawValidEntities;

    try {
      depositValidEntities = await this.queryBus.execute(
        new GetNormalizedEntitiesQuery(event.payload.destinationProfileId, {
          destinationAccountId: event.payload.dto.destinationAccountId,
          amount: event.payload.dto.amount,
          currencyTicker: event.payload.dto.currencyTicker,
        } as DepositMoneyDto)
      );

      withdrawValidEntities = await this.queryBus.execute(
        new GetNormalizedEntitiesQuery(event.payload.sourceProfileId, {
          sourceAccountId: event.payload.dto.sourceAccountId,
          amount: event.payload.dto.amount,
          currencyTicker: event.payload.dto.currencyTicker,
        } as WithdrawMoneyDto)
      );
    } catch (error) {
      this.logger.error(error.message);

      return null;
    }

    if (!depositValidEntities || !withdrawValidEntities) {
      this.logger.error('Cannot get valid entities');

      return null;
    }

    this.transferMoneySagaTraceback.push({
      traceId: event.payload.traceId,
      initialState: {
        sourceAccount: withdrawValidEntities.account,
        destinationAccount: depositValidEntities.account,
      },
    });

    try {
      this.logger.log(`Started with traceId: ${event.payload.traceId}`);

      await this.transactionService.create({
        id: event.payload.traceId,
        currencyId: depositValidEntities.currency.id,
        purpose: TransactionPurpose.EXTERNAL_TRANSFER,
        ...event.payload.dto,
      });

      return new VerifyTransactionSubcommand(event.payload.traceId);
    } catch (error) {
      this.logger.error(error.message);

      return null;
    }
  }

  private async handleVerifyTransactionSubcommand(
    event: EventInterface
  ): Promise<IEvent | ICommand | null> {
    const ctx = await this.getContextByTraceId(event.payload.traceId);

    if (!ctx) {
      return this.failSaga(event.payload.traceId, 'Cannot get ctx');
    }

    if (ctx.transaction.status !== TransactionStatus.APPROVED) {
      return this.failSaga(event.payload.traceId, 'Transaction is not approved');
    }

    return new OuterTransferMoneySubcommand(ctx.data.traceId);
  }

  private async handleOuterTransferMoneySubcommand(event: EventInterface): Promise<IEvent | null> {
    const traceId = event.payload.id;

    const ctx = await this.getContextByTraceId(traceId);

    if (!ctx) {
      return this.failSaga(traceId, `Failed to get ctx for traceId ${traceId}`);
    }

    if (ctx.transaction.status !== TransactionStatus.FINISHED) {
      return this.failSaga(traceId, `Failed to finish transaction ${traceId}`);
    }

    if (
      ctx.sourceAccount.balance !==
      ctx.data.initialState.sourceAccount.balance - ctx.transaction.amount
    ) {
      return this.failSaga(traceId, `Failed to withdraw money in transaction ${traceId}`);
    }

    if (
      ctx.destinationAccount.balance !==
      ctx.data.initialState.destinationAccount.balance + ctx.transaction.amount
    ) {
      return this.failSaga(traceId, `Failed to deposit money in transaction ${traceId}`);
    }

    return this.finishSaga(traceId);
  }

  private async failSaga(traceId: string, message: string): Promise<null> {
    const ctx = await this.getContextByTraceId(traceId);

    if (!ctx) {
      return null;
    }

    await this.accountService.setState(ctx.data.initialState.sourceAccount);
    await this.accountService.setState(ctx.data.initialState.destinationAccount);

    this.logger.error(message);
    await this.transactionService.failTransaction(ctx.data.traceId, message);

    this.transferMoneySagaTraceback = this.transferMoneySagaTraceback.filter(
      (tracebackData) => tracebackData.traceId !== ctx.data.traceId
    );

    return null;
  }

  private async finishSaga(traceId: string): Promise<null> {
    const ctx = await this.getContextByTraceId(traceId);

    if (!ctx) {
      return null;
    }

    this.logger.log(`Handled ${traceId}`);
    this.transferMoneySagaTraceback = this.transferMoneySagaTraceback.filter(
      (tracebackData) => tracebackData.traceId !== ctx.data.traceId
    );

    return null;
  }
}
