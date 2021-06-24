import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@ValidatorConstraint({ name: 'GroupExistsRule', async: true })
@Injectable()
export class GroupExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('AUDIENCE_SERVICE')
    private audienceService: ClientKafka,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    const result = await this.audienceService
      .send('existsGroup', {
        id: value,
        organization_id: (args.object as any)['organization_id'],
      })
      .toPromise();

    //todo: https://github.com/nestjs/nest/issues/7185

    return result === 'true';
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
