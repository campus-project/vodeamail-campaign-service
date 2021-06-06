import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailCampaignAudience } from './email-campaign-audience.entity';

export enum EmailCampaignAnalyticType {
  'OPENED',
  'CLICKED',
  'UNSUBSCRIBED',
}

@Entity('email_campaign_analytics')
export class EmailCampaignAnalytic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  email_campaign_id: string;

  @Column({ type: 'uuid' })
  email_campaign_audience_id: string;

  @Column({ type: 'enum', enum: EmailCampaignAnalyticType })
  type: EmailCampaignAnalyticType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_groups)
  email_campaign: EmailCampaign;

  @ManyToOne(
    () => EmailCampaignAudience,
    (object) => object.email_campaign_analytics,
  )
  email_campaign_audience: EmailCampaignAudience;
}
