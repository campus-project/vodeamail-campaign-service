import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailCampaignGroup } from './email-campaign-group.entity';
import { EmailCampaignAudience } from './email-campaign-audience.entity';
import { EmailCampaignAnalytic } from './email-campaign-analytic.entity';

@Entity('email_campaigns')
export class EmailCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  from_name: string;

  @Column({ type: 'varchar' })
  from: string;

  @Column({ type: 'varchar' })
  domain: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  send_at: string;

  @Column({ type: 'tinyint', default: 1 })
  is_directly_send: boolean;

  @Column({ type: 'uuid' })
  email_template_id: string;

  @Column({ type: 'text' })
  email_template_html: string;

  @Column({ type: 'text' })
  email_template_design: string;

  @Column({ type: 'text' })
  email_template_example_value_tags: string;

  @Column({ type: 'varchar' })
  email_template_image_url: string;

  @CreateDateColumn()
  created_at: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @OneToMany(() => EmailCampaignGroup, (object) => object.email_campaign)
  email_campaign_groups: EmailCampaignGroup[];

  @OneToMany(() => EmailCampaignAudience, (object) => object.email_campaign)
  email_campaign_audiences: EmailCampaignAudience[];

  @OneToMany(() => EmailCampaignAudience, (object) => object.email_campaign)
  email_campaign_analytics: EmailCampaignAnalytic[];
}