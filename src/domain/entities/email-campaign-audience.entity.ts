import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';
import { EmailCampaignAnalytic } from './email-campaign-analytic.entity';

@Entity('email_campaign_audiences')
export class EmailCampaignAudience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  email_campaign_id: string;

  @Column({ type: 'uuid' })
  contact_id: string;

  @Column({ type: 'varchar' })
  to: string;

  @Column({ type: 'varchar', nullable: true })
  to_name?: string;

  @Column({ type: 'text' })
  value_tags: string;

  @Column({ type: 'text' })
  html: string;

  @Column({ type: 'tinyint', default: 1 })
  is_subscribed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  accepted: string;

  @Column({ type: 'timestamp', nullable: true })
  delivered: string;

  @Column({ type: 'timestamp', nullable: true })
  opened: string;

  @Column({ type: 'timestamp', nullable: true })
  clicked: string;

  @Column({ type: 'timestamp', nullable: true })
  failed: string;

  @Column({ type: 'text', nullable: true })
  failed_message: string;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_groups)
  email_campaign: EmailCampaign;

  @OneToMany(() => EmailCampaignAnalytic, (object) => object.email_campaign)
  email_campaign_analytics: EmailCampaignAnalytic[];
}
