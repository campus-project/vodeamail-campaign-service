import { JoinColumn, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';

@ViewEntity({
  name: 'summary_email_campaign_analytics',
  expression: `
    SELECT
      email_campaign_analytics.email_campaign_id,
      DATE_FORMAT( email_campaign_analytics.timestamp, '%Y-%m-%dT00:00:00.000Z' ) AS date,
      SUM(IF (email_campaign_analytics.type = '0', 1, 0)) AS total_opened,
      SUM(IF (email_campaign_analytics.type = '1', 1, 0)) AS total_clicked
    FROM
        email_campaign_analytics
    GROUP BY
        date, email_campaign_id`,
})
export class SummaryEmailCampaignAnalyticView {
  @ViewColumn()
  email_campaign_id: string;

  @ViewColumn()
  date: string;

  @ViewColumn()
  total_opened: number;

  @ViewColumn()
  total_clicked: number;

  @ManyToOne(() => EmailCampaign, (object) => object.summary)
  @JoinColumn({ name: 'email_campaign_id' })
  email_campaign: EmailCampaign;
}
