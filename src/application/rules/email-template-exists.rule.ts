import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { EmailTemplateService } from '../../domain/services/email-template.service';

@ValidatorConstraint({ name: 'EmailTemplateExistsRule', async: true })
@Injectable()
export class EmailTemplateExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('EMAIL_TEMPLATE_SERVICE')
    private emailTemplateService: EmailTemplateService,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    return await this.emailTemplateService.idExists({
      id: value,
      organization_id: (args.object as any)['organization_id'],
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
