import { Controller, Inject } from '@nestjs/common';

import { EmailCampaignAudienceService } from '../../domain/services/email-campaign-audience.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AcceptedEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/accepted-email-campaign-audience.dto';
import { DeliveredEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/delivered-email-campaign-audience.dto';
import { OpenedEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/opened-email-campaign-audience.dto';
import { ClickedEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/clicked-email-campaign-audience.dto';
import { UnsubscribeEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/unsubscribe-email-campaign-audience.dto';
import { FailedEmailCampaignAudienceDto } from '../dtos/email-campaign-audience/failed-email-campaign-audience.dto';

@Controller()
export class EmailCampaignAnalyticController {
  constructor(
    @Inject('EMAIL_CAMPAIGN_AUDIENCE_SERVICE')
    private readonly emailCampaignAudienceService: EmailCampaignAudienceService,
  ) {}

  @MessagePattern('acceptedEmailCampaignAudience')
  async accepted(
    @Payload()
    acceptedEmailCampaignAudienceDto: AcceptedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setAccepted(
      acceptedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('deliveredEmailCampaignAudience')
  async delivered(
    @Payload()
    deliveredEmailCampaignAudienceDto: DeliveredEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setDelivered(
      deliveredEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('failedEmailCampaignAudience')
  async failed(
    @Payload()
    failedEmailCampaignAudienceDto: FailedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setUnsubscribe(
      failedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('openedEmailCampaignAudience')
  async opened(
    @Payload()
    openedEmailCampaignAudienceDto: OpenedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setOpened(
      openedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('clickedEmailCampaignAudience')
  async clicked(
    @Payload()
    clickedEmailCampaignAudienceDto: ClickedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setClicked(
      clickedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('unsubscribeEmailCampaignAudience')
  async unsubscribe(
    @Payload()
    unsubscribeEmailCampaignAudienceDto: UnsubscribeEmailCampaignAudienceDto,
  ): Promise<boolean> {
    return this.emailCampaignAudienceService.setUnsubscribe(
      unsubscribeEmailCampaignAudienceDto,
    );
  }
}
