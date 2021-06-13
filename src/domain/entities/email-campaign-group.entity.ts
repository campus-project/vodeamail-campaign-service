import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailCampaign } from './email-campaign.entity';

@Entity('email_campaign_groups')
export class EmailCampaignGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  email_campaign_id: string;

  @Column({ type: 'uuid' })
  group_id: string;

  @Column({ type: 'int', unsigned: true })
  total_contact: number;

  @ManyToOne(() => EmailCampaign, (object) => object.email_campaign_groups)
  email_campaign: EmailCampaign;
}
