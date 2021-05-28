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
  accepted(
    @Payload('value')
    acceptedEmailCampaignAudienceDto: AcceptedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setAccepted(
      acceptedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('deliveredEmailCampaignAudience')
  delivered(
    @Payload('value')
    deliveredEmailCampaignAudienceDto: DeliveredEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setDelivered(
      deliveredEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('failedEmailCampaignAudience')
  failed(
    @Payload('value')
    failedEmailCampaignAudienceDto: FailedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setUnsubscribe(
      failedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('openedEmailCampaignAudience')
  opened(
    @Payload('value')
    openedEmailCampaignAudienceDto: OpenedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setOpened(
      openedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('clickedEmailCampaignAudience')
  clicked(
    @Payload('value')
    clickedEmailCampaignAudienceDto: ClickedEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setClicked(
      clickedEmailCampaignAudienceDto,
    );
  }

  @MessagePattern('unsubscribeEmailCampaignAudience')
  unsubscribe(
    @Payload('value')
    unsubscribeEmailCampaignAudienceDto: UnsubscribeEmailCampaignAudienceDto,
  ) {
    return this.emailCampaignAudienceService.setUnsubscribe(
      unsubscribeEmailCampaignAudienceDto,
    );
  }
}
