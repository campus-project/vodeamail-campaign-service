import { Test, TestingModule } from '@nestjs/testing';
import { EmailCampaignAudienceService } from '../services/email-campaign-audience.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from '../entities/email-campaign-analytic.entity';

describe('EmailCampaignAudienceService', () => {
  let service: EmailCampaignAudienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        InfrastructureModule,
        TypeOrmModule.forFeature([
          EmailCampaignAudience,
          EmailCampaignAnalytic,
        ]),
      ],
      providers: [EmailCampaignAudienceService],
    }).compile();

    service = module.get<EmailCampaignAudienceService>(
      EmailCampaignAudienceService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
