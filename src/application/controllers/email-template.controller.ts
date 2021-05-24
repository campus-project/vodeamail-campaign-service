import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailTemplateService } from '../../domain/services/email-template.service';
import { CreateEmailTemplateDto } from '../dtos/email-template/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dtos/email-template/update-email-template.dto';
import { FindEmailTemplateDto } from '../dtos/email-template/find-email-template.dto';
import { DeleteEmailTemplateDto } from '../dtos/email-template/delete-email-template.dto';

@Controller()
export class EmailTemplateController {
  constructor(
    @Inject('EMAIL_TEMPLATE_SERVICE')
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @MessagePattern('createEmailTemplate')
  create(
    @Payload('value')
    createEmailTemplateDto: CreateEmailTemplateDto,
  ) {
    return this.emailTemplateService.create(createEmailTemplateDto);
  }

  @MessagePattern('findAllEmailTemplate')
  findAll(@Payload('value') findEmailTemplate: FindEmailTemplateDto) {
    return this.emailTemplateService.findAll(findEmailTemplate);
  }

  @MessagePattern('findOneEmailTemplate')
  findOne(@Payload('value') findEmailTemplate: FindEmailTemplateDto) {
    return this.emailTemplateService.findOne(findEmailTemplate);
  }

  @MessagePattern('updateEmailTemplate')
  update(@Payload('value') updateEmailTemplateDto: UpdateEmailTemplateDto) {
    return this.emailTemplateService.update(updateEmailTemplateDto);
  }

  @MessagePattern('removeEmailTemplate')
  remove(@Payload('value') deleteEmailTemplate: DeleteEmailTemplateDto) {
    return this.emailTemplateService.remove(deleteEmailTemplate);
  }
}
