import { Query } from '@nestjs/cqrs';
import { NormalizedEntities } from './get-normalized-entities.query';
import { ValidationResponse } from '../../base/validation-response.interface';

export class ValidateDepositQuery extends Query<ValidationResponse> {
  constructor(
    public readonly entities: NormalizedEntities,
    public readonly amount: number,
    public readonly traceId?: string
  ) {
    super();
  }
}
