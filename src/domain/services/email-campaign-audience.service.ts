import { Inject, Injectable } from '@nestjs/common';
import { IsNull, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { Cron } from '@nestjs/schedule';

import * as moment from 'moment';

import { AcceptedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/accepted-email-campaign-audience.dto';
import { DeliveredEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/delivered-email-campaign-audience.dto';
import { OpenedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/opened-email-campaign-audience.dto';
import {
  EmailCampaignAnalytic,
  EmailCampaignAnalyticType,
} from '../entities/email-campaign-analytic.entity';
import { ClickedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/clicked-email-campaign-audience.dto';
import { UnsubscribeEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/unsubscribe-email-campaign-audience.dto';
import { FailedEmailCampaignAudienceDto } from '../../application/dtos/email-campaign-audience/failed-email-campaign-audience.dto';
import { ConfigService } from '@nestjs/config';

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
  async jobDispatcher() {
    const emailCampaignAudiences =
      await this.emailCampaignAudienceRepository.find({
        join: {
          alias: 'audience',
          leftJoinAndSelect: {
            email_campaign: 'audience.email_campaign',
          },
        },
        where: (qb) => {
          qb.where([
            { accepted: IsNull(), delivered: IsNull(), failed: IsNull() },
            {
              accepted: Raw((alias) => `${alias} IS NOT NULL`),
              delivered: IsNull(),
              failed: IsNull(),
            },
          ])
            .andWhere('email_campaign.send_at <= NOW()')
            .andWhere('email_campaign.deleted_at IS NULL');
        },
      });

    for (const emailCampaignAudience of emailCampaignAudiences) {
      const emailCampaign = emailCampaignAudience.email_campaign;

      let content = emailCampaignAudience.html;
      content = this.injectLinkTracker(emailCampaignAudience.id, content);
      content = this.injectPixelTracker(emailCampaignAudience.id, content);

      let exceptionMessage = null;
      const sendEmail = await this.clientKafka
        .send('createSendEmail', {
          organization_id: emailCampaign.organization_id,
          from: `${emailCampaign.from}@${emailCampaign.domain}`,
          from_name: emailCampaign.from_name,
          to: emailCampaignAudience.to,
          to_name: emailCampaignAudience.to_name,
          subject: emailCampaign.subject,
          html: content,
          external_id: emailCampaignAudience.id,
        })
        .toPromise()
        .catch((e) => (exceptionMessage = e));

      if (exceptionMessage !== null) {
        //prevent multiple request
        if (exceptionMessage?.statusCode !== 400) {
          await this.setFailed({
            id: emailCampaignAudience.id,
            timestamp: moment().utc().toISOString(),
            failed: JSON.stringify(exceptionMessage),
          });
        }
      } else if (sendEmail) {
        await Promise.all([
          this.setAccepted({
            id: emailCampaignAudience.id,
            timestamp: moment().utc().toISOString(),
          }),
          this.setDelivered({
            id: emailCampaignAudience.id,
            timestamp: moment().utc().toISOString(),
          }),
        ]);
      }
    }
  }

  injectLinkTracker(emailAudienceId: string, html: string): string {
    const config = new ConfigService();
    const baseClickURL =
      config.get<string>('BASE_CLICK_TRACKER_URL') ||
      'http://localhost:3010/v1/c/';

    return html.replace(
      new RegExp(/(<a[^>]*href=["])([^"]*)/, 'gm'),
      function (m, $1, $2) {
        const newUrl = !$2
          ? '/'
          : `${baseClickURL}/${encodeURIComponent(
              emailAudienceId,
            )}/${encodeURIComponent($2)}`;

        return $1 + newUrl;
      },
    );
  }

  injectPixelTracker(emailAudienceId: string, html: string) {
    const config = new ConfigService();
    const baseOpenURL =
      config.get<string>('BASE_OPEN_TRACKER_URL') ||
      'http://localhost:3010/v1/o/';

    const trackingPixel = `<img alt="" style="height: 1px; width: 1px; border: 0" src="${baseOpenURL}/${emailAudienceId}" />`;
    return html.replace('\n', trackingPixel);
  }

  async setAccepted(
    acceptedEmailCampaignAudienceDto: AcceptedEmailCampaignAudienceDto,
  ): Promise<boolean> {
    const { id, timestamp } = acceptedEmailCampaignAudienceDto;

    const emailCampaignAudience =
      await this.emailCampaignAudienceRepository.findOne({
        where: {
          id,
          accepted: IsNull(),
        },
      });

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
      await this.emailCampaignAudienceRepository.findOne({
        where: { id, delivered: IsNull() },
      });

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
      if (emailCampaignAudience.opened === null) {
        await this.emailCampaignAudienceRepository.save({
          ...emailCampaignAudience,
          opened: timestamp,
        });
      }

      await this.emailCampaignAnalyticRepository.save({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: EmailCampaignAnalyticType.OPENED,
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
      if (emailCampaignAudience.clicked === null) {
        await this.emailCampaignAudienceRepository.save({
          ...emailCampaignAudience,
          clicked: timestamp,
        });
      }

      await this.emailCampaignAnalyticRepository.save({
        email_campaign_id: emailCampaignAudience.email_campaign_id,
        email_campaign_audience_id: emailCampaignAudience.id,
        type: EmailCampaignAnalyticType.CLICKED,
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
        type: EmailCampaignAnalyticType.UNSUBSCRIBED,
        timestamp,
      });

      await this.clientKafka
        .send('updateSubscribeContact', {
          id: emailCampaignAudience.contact_id,
          organization_id: emailCampaignAudience.email_campaign.organization_id,
          is_subscribed: false,
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
