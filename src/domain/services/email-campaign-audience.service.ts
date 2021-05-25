import { Inject, Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { Cron } from '@nestjs/schedule';

import * as moment from 'moment';
import { AcceptedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/accepted-email-campaign-audience.dto';
import { DeliveredEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/delivered-email-campaign-audience.dto';
import { OpenedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/opened-email-campaign-audience.dto';
import { EmailCampaignAnalytic } from '../entities/email-campaign-analytic.entity';
import { ClickedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/clicked-email-campaign-audience.dto';
import { UnsubscribeEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/unsubscribe-email-campaign-audience.dto';
import { FailedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/failed-email-campaign-audience.dto';

@Injectable()
export class EmailCampaignAudienceService {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
    @InjectRepository(EmailCampaignAudience)
    private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>,
    @InjectRepository(EmailCampaignAnalytic)
    private readonly emailCampaignAnalyticRepository: Repository<EmailCampaignAnalytic>,
  ) {}

  onModuleInit() {
    const patterns = ['createSendEmail', 'updateSubscribeContact'];
    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  @Cron('*/3 * * * * *')
  async dispatcherJob() {
    const emailCampaignAudiences =
      await this.emailCampaignAudienceRepository.find({
        join: {
          alias: 'audience',
          leftJoinAndSelect: {
            email_campaign: 'audience.email_campaign',
          },
        },
        where: (qb) => {
          qb.where({
            is_subscribed: 1,
            accepted: IsNull(),
            failed: IsNull(),
          })
            .andWhere('email_campaign.deleted_at IS NULL')
            .andWhere('email_campaign.send_at <= NOW()');
        },
      });

    for (const emailCampaignAudience of emailCampaignAudiences) {
      await this.sendEmail(emailCampaignAudience).catch();
    }
  }

  @Cron('*/15 * * * * *')
  async dispatcherFailedJob() {
    const emailCampaignAudiences =
      await this.emailCampaignAudienceRepository.find({
        join: {
          alias: 'audience',
          leftJoinAndSelect: {
            email_campaign: 'audience.email_campaign',
          },
        },
        where: (qb) => {
          qb.where({
            is_subscribed: 1,
            failed: IsNull(),
            delivered: IsNull(),
          })
            .where('audience.accepted IS NOT NULL')
            .andWhere('email_campaign.deleted_at IS NULL')
            .andWhere('email_campaign.send_at <= NOW()');
        },
      });

    for (const emailCampaignAudience of emailCampaignAudiences) {
      await this.sendEmail(emailCampaignAudience).catch();
    }
  }

  async sendEmail(emailCampaignAudience: EmailCampaignAudience) {
    const emailCampaign = emailCampaignAudience.email_campaign;

    delete emailCampaignAudience.email_campaign;

    await this.clientKafka
      .send('createSendEmail', {
        organization_id: emailCampaign.organization_id,
        from: `${emailCampaign.from}@${emailCampaign.domain}`,
        from_name: emailCampaign.from_name,
        to: emailCampaignAudience.to,
        to_name: emailCampaignAudience.to_name,
        subject: emailCampaign.subject,
        html: emailCampaignAudience.html,
      })
      .toPromise();

    await this.setAccepted({
      id: emailCampaignAudience.id,
      timestamp: moment().utc().toISOString(),
    });

    await this.setDelivered({
      id: emailCampaignAudience.id,
      timestamp: moment().utc().toISOString(),
    });
  }

  async setAccepted(
    acceptedEmailCampaignAudienceDto: AcceptedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    const { id, timestamp } = acceptedEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({ id });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        accepted: timestamp,
      });
    }

    return true;
  }

  async setDelivered(
    deliveredEmailCampaignAudienceDto: DeliveredEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = deliveredEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({ id });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        delivered: timestamp,
      });
    }

    return true;
  }

  async setOpened(
    openedEmailCampaignAudienceDto: OpenedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = openedEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({ id });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        opened: timestamp,
      });

      await this.emailCampaignAnalyticRepository.save({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: 0,
        timestamp,
      });
    }

    return true;
  }

  async setClicked(
    clickedEmailCampaignAudienceDto: ClickedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = clickedEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({ id });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        clicked: timestamp,
      });

      await this.emailCampaignAnalyticRepository.save({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: 1,
        timestamp,
      });
    }

    return true;
  }

  async setUnsubscribe(
    unsubscribeEmailCampaignAudienceDto: UnsubscribeEmailCampaignAudienceDto,
  ) {
    const { id, timestamp } = unsubscribeEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({
        join: {
          alias: 'audience',
          leftJoinAndSelect: {
            email_campaign: 'audience.email_campaign',
          },
        },
        where: { id },
      });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        is_subscribed: false,
      });

      await this.emailCampaignAnalyticRepository.save({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: 2,
        timestamp,
      });

      //todo: to be test
      await this.clientKafka
        .send('updateSubscribeContact', {
          id: emailCampaignAudience.contact_id,
          organization_id: emailCampaignAudience.email_campaign.organization_id,
          is_subscribed: 0,
        })
        .toPromise();
    }

    return true;
  }

  async setFailed(
    failedEmailCampaignAudienceDto: FailedEmailCampaignAudienceDto,
  ) {
    const { id, timestamp, failed } = failedEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({ id });

    if (emailCampaignAudience) {
      await this.emailCampaignAudienceRepository.save({
        ...emailCampaignAudience,
        failed: timestamp,
        failed_message: failed,
      });
    }

    return true;
  }
}
