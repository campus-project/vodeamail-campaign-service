import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailCampaignService } from '../../domain/services/email-campaign.service';
import { CreateEmailCampaignDto } from '../dtos/email-campaign/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../dtos/email-campaign/update-email-campaign.dto';
import { FindEmailCampaignDto } from '../dtos/email-campaign/find-email-campaign.dto';
import { DeleteEmailCampaignDto } from '../dtos/email-campaign/delete-email-campaign.dto';
import { FindEmailTemplateDto } from '../dtos/email-template/find-email-template.dto';

@Controller()
export class EmailCampaignController {
  constructor(
    @Inject('EMAIL_CAMPAIGN_SERVICE')
    private readonly emailCampaignService: EmailCampaignService,
  ) {}

  @MessagePattern('createEmailCampaign')
  create(
    @Payload('value')
    createEmailCampaignDto: CreateEmailCampaignDto,
  ) {
    return this.emailCampaignService.create(createEmailCampaignDto);
  }

  @MessagePattern('findAllEmailCampaign')
  findAll(@Payload('value') findEmailCampaign: FindEmailCampaignDto) {
    return this.emailCampaignService.findAll(findEmailCampaign);
  }

  @MessagePattern('findAllCountEmailCampaign')
  findAllCount(@Payload('value') findEmailCampaign: FindEmailCampaignDto) {
    return this.emailCampaignService.findAllCount(findEmailCampaign);
  }

  @MessagePattern('findOneEmailCampaign')
  findOne(@Payload('value') findEmailCampaign: FindEmailCampaignDto) {
    return this.emailCampaignService.findOne(findEmailCampaign);
  }

  @MessagePattern('updateEmailCampaign')
  update(@Payload('value') updateEmailCampaignDto: UpdateEmailCampaignDto) {
    return this.emailCampaignService.update(updateEmailCampaignDto);
  }

  @MessagePattern('removeEmailCampaign')
  remove(@Payload('value') deleteEmailCampaign: DeleteEmailCampaignDto) {
    return this.emailCampaignService.remove(deleteEmailCampaign);
  }
}
