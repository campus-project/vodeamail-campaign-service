import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailTemplateService } from './services/email-template.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { EmailAnalyticService } from './services/email-analytic.service';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailCampaign } from './entities/email-campaign.entity';
import { EmailCampaignGroup } from './entities/email-campaign-group.entity';
import { EmailCampaignAudience } from './entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from './entities/email-campaign-analytic.entity';
import { EmailCampaignAudienceService } from './services/email-campaign-audience.service';

const providers: Provider[] = [
  {
    provide: 'EMAIL_TEMPLATE_SERVICE',
    useClass: EmailTemplateService,
  },
  {
    provide: 'EMAIL_CAMPAIGN_SERVICE',
    useClass: EmailCampaignService,
  },
  {
    provide: 'EMAIL_CAMPAIGN_AUDIENCE_SERVICE',
    useClass: EmailCampaignAudienceService,
  },
  {
    provide: 'EMAIL_ANALYTIC_SERVICE',
    useClass: EmailAnalyticService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([
      EmailTemplate,
      EmailCampaign,
      EmailCampaignGroup,
      EmailCampaignAudience,
      EmailCampaignAnalytic,
    ]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
