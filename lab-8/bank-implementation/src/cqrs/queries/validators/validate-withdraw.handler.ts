import { EventBus, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccountService } from '../../../models/account/account.service';
import { ValidateWithdrawQuery } from './validate-withdraw.query';
import { BaseQueryHandler } from '../../base/base-query.handler';
import { ValidationResponse } from '../../base/validation-response.interface';

@QueryHandler(ValidateWithdrawQuery)
export class ValidateWithdrawHandler
  extends BaseQueryHandler
  implements IQueryHandler<ValidateWithdrawQuery>
{
  constructor(
    protected readonly eventBus: EventBus,
    private readonly service: AccountService
  ) {
    super(eventBus, ValidateWithdrawQuery.name);
  }

  async execute(query: ValidateWithdrawQuery): Promise<ValidationResponse> {
    this.interceptExecution({
      entities: query.entities,
      amount: query.amount,
    });

    return this.handleQuery(query)
      .then((result) => {
        if (!result.success) {
          this.interceptError(result, result.errorInstance.message);

          return result;
        }

        return this.interceptHandledResult(result);
      })
      .catch((error) => {
        throw this.interceptError(error, error.message);
      });
  }

  protected async handleQuery(query: ValidateWithdrawQuery): Promise<ValidationResponse> {
    try {
      await this.service.getAndValidateAccountForWithdraw(
        query.entities.account.id,
        query.amount,
        query.entities.currency.id,
        query.entities.transaction?.id
      );
    } catch (error) {
      return {
        success: false,
        errorInstance: error,
      };
    }

    return { success: true };
  }
}
