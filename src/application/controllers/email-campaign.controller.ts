import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailCampaignService } from '../../domain/services/email-campaign.service';
import { CreateEmailCampaignDto } from '../dtos/email-campaign/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../dtos/email-campaign/update-email-campaign.dto';
import { FindEmailCampaignDto } from '../dtos/email-campaign/find-email-campaign.dto';
import { DeleteEmailCampaignDto } from '../dtos/email-campaign/delete-email-campaign.dto';
import { EmailCampaign } from '../../domain/entities/email-campaign.entity';
import { SummaryUsageEmailCampaignView } from '../../domain/views/summary-usage-email-campaign.view';

@Controller()
export class EmailCampaignController {
  constructor(
    @Inject('EMAIL_CAMPAIGN_SERVICE')
    private readonly emailCampaignService: EmailCampaignService,
  ) {}

  @MessagePattern('createEmailCampaign')
  async create(
    @Payload()
    createEmailCampaignDto: CreateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    return await this.emailCampaignService.create(createEmailCampaignDto);
  }

  @MessagePattern('findAllEmailCampaign')
  async findAll(
    @Payload() findEmailCampaign: FindEmailCampaignDto,
  ): Promise<EmailCampaign[]> {
    return await this.emailCampaignService.findAll(findEmailCampaign);
  }

  @MessagePattern('findAllCountEmailCampaign')
  async findAllCount(
    @Payload() findEmailCampaign: FindEmailCampaignDto,
  ): Promise<number> {
    return await this.emailCampaignService.findAllCount(findEmailCampaign);
  }

  @MessagePattern('findSummaryUsageEmailCampaign')
  async summaryUsage(
    @Payload() findEmailCampaign: FindEmailCampaignDto,
  ): Promise<SummaryUsageEmailCampaignView> {
    return await this.emailCampaignService.summaryUsage(findEmailCampaign);
  }

  @MessagePattern('findOneEmailCampaign')
  async findOne(
    @Payload() findEmailCampaign: FindEmailCampaignDto,
  ): Promise<EmailCampaign> {
    return await this.emailCampaignService.findOne(findEmailCampaign);
  }

  @MessagePattern('updateEmailCampaign')
  async update(
    @Payload() updateEmailCampaignDto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    return await this.emailCampaignService.update(updateEmailCampaignDto);
  }

  @MessagePattern('removeEmailCampaign')
  async remove(
    @Payload() deleteEmailCampaign: DeleteEmailCampaignDto,
  ): Promise<EmailCampaign> {
    return await this.emailCampaignService.remove(deleteEmailCampaign);
  }
}
