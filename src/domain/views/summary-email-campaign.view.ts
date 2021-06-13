import { JoinColumn, OneToOne, ViewColumn, ViewEntity } from 'typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';

@ViewEntity({
  name: 'summary_email_campaigns',
  expression: `
    SELECT
      email_campaigns.id AS email_campaign_id,
      CONCAT(email_campaigns.from, "@", email_campaigns.domain) as from_email,
      COALESCE ( email_campaign_groups.total_group, 0 ) total_group,
      COALESCE ( email_campaign_audiences.total_audience, 0 ) total_audience,
      COALESCE ( email_campaign_audiences.total_delivered, 0 ) total_delivered,
      COALESCE ( email_campaign_audiences.total_clicked, 0 ) total_clicked,
      COALESCE ( email_campaign_audiences.total_opened, 0 ) total_opened,
      COALESCE ( email_campaign_audiences.total_unsubscribe, 0 ) total_unsubscribe,
      (SELECT max(timestamp) FROM email_campaign_analytics t1 where t1.email_campaign_id = email_campaigns.id AND t1.type = '0') as last_opened,
      (SELECT max(timestamp) FROM email_campaign_analytics t1 where t1.email_campaign_id = email_campaigns.id AND t1.type = '1') as last_clicked,
      open_rate_email_campaigns.avg_open_duration
    FROM
      email_campaigns
    LEFT JOIN ( 
      SELECT 
        email_campaign_groups.email_campaign_id, 
        COUNT( DISTINCT email_campaign_groups.group_id ) AS total_group 
      FROM
        email_campaign_groups
      GROUP BY 
        email_campaign_groups.email_campaign_id 
    ) email_campaign_groups ON email_campaign_groups.email_campaign_id = email_campaigns.id
    LEFT JOIN (
      SELECT
        email_campaign_audiences.email_campaign_id,
        CEIL(AVG(TIMESTAMPDIFF( MINUTE, t1.send_at, email_campaign_audiences.opened ))) AS avg_open_duration 
      FROM
        email_campaign_audiences
        JOIN email_campaigns AS t1 ON t1.id = email_campaign_audiences.email_campaign_id 
      WHERE
        email_campaign_audiences.opened IS NOT NULL 
      GROUP BY
        email_campaign_id
    ) open_rate_email_campaigns ON open_rate_email_campaigns.email_campaign_id = email_campaigns.id 
    LEFT JOIN ( 
      SELECT 
        email_campaign_audiences.email_campaign_id, 
        COUNT( email_campaign_audiences.contact_id ) AS total_audience,
        SUM(IF (email_campaign_audiences.delivered IS NULL, 0, 1)) AS total_delivered,
        SUM(IF (email_campaign_audiences.clicked IS NULL, 0, 1)) AS total_clicked,
        SUM(IF (email_campaign_audiences.opened IS NULL, 0, 1)) AS total_opened,
        SUM(IF (email_campaign_audiences.is_subscribed = 0, 1, 0)) AS total_unsubscribe
      FROM
        email_campaign_audiences
      GROUP BY 
        email_campaign_audiences.email_campaign_id 
    ) email_campaign_audiences ON email_campaign_audiences.email_campaign_id = email_campaigns.id`,
})
export class SummaryEmailCampaignView {
  @ViewColumn()
  email_campaign_id: string;

  @ViewColumn()
  from_email: string;

  @ViewColumn()
  total_group: number;

  @ViewColumn()
  total_audience: number;

  @ViewColumn()
  total_delivered: number;

  @ViewColumn()
  total_clicked: number;

  @ViewColumn()
  total_opened: number;

  @ViewColumn()
  total_unsubscribe: number;

  @ViewColumn()
  last_opened: string;

  @ViewColumn()
  last_clicked: string;

  @ViewColumn()
  avg_open_duration: number;

  @OneToOne(() => EmailCampaign, (object) => object.summary)
  @JoinColumn({ name: 'email_campaign_id' })
  email_campaign: EmailCampaign;
}
