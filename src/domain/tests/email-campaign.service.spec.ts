import { Test, TestingModule } from '@nestjs/testing';
import { EmailCampaignService } from '../services/email-campaign.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { SummaryUsageEmailCampaignView } from '../views/summary-usage-email-campaign.view';

describe('EmailCampaignService', () => {
  let service: EmailCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        InfrastructureModule,
        TypeOrmModule.forFeature([
          EmailCampaign,
          EmailCampaignGroup,
          EmailCampaignAudience,
          EmailTemplate,
          SummaryUsageEmailCampaignView,
        ]),
      ],
      providers: [EmailCampaignService],
    }).compile();

    service = module.get<EmailCampaignService>(EmailCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
