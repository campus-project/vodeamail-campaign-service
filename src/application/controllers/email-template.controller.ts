import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailTemplateService } from '../../domain/services/email-template.service';
import { CreateEmailTemplateDto } from '../dtos/email-template/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../dtos/email-template/update-email-template.dto';
import { FindEmailTemplateDto } from '../dtos/email-template/find-email-template.dto';
import { DeleteEmailTemplateDto } from '../dtos/email-template/delete-email-template.dto';
import { EmailTemplate } from '../../domain/entities/email-template.entity';

@Controller()
export class EmailTemplateController {
  constructor(
    @Inject('EMAIL_TEMPLATE_SERVICE')
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  @MessagePattern('createEmailTemplate')
  async create(
    @Payload()
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.create(createEmailTemplateDto);
  }

  @MessagePattern('findAllEmailTemplate')
  async findAll(
    @Payload() findEmailTemplate: FindEmailTemplateDto,
  ): Promise<EmailTemplate[]> {
    return await this.emailTemplateService.findAll(findEmailTemplate);
  }

  @MessagePattern('findAllCountEmailTemplate')
  async findAllCount(
    @Payload() findEmailTemplate: FindEmailTemplateDto,
  ): Promise<number> {
    return await this.emailTemplateService.findAllCount(findEmailTemplate);
  }

  @MessagePattern('findOneEmailTemplate')
  async findOne(
    @Payload() findEmailTemplate: FindEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.findOne(findEmailTemplate);
  }

  @MessagePattern('updateEmailTemplate')
  async update(
    @Payload() updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.update(updateEmailTemplateDto);
  }

  @MessagePattern('removeEmailTemplate')
  async remove(
    @Payload() deleteEmailTemplate: DeleteEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return await this.emailTemplateService.remove(deleteEmailTemplate);
  }
}
