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
    @Inject('CLIENT_KAFKA')
    private clientKafka: ClientKafka,
  ) {}

  async onModuleInit() {
    const patterns = ['existsGroup'];
    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }

    await this.clientKafka.connect();
  }

  async validate(value: string, args: ValidationArguments) {
    if (!value) {
      return false;
    }

    const result = await this.clientKafka
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
