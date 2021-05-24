import { Module } from '@nestjs/common';

import { EmailTemplateExistsRule } from './rules/email-template-exists.rule';

import { DomainModule } from '../domain/domain.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailTemplateController } from './controllers/email-template.controller';
import { EmailCampaignController } from './controllers/email-campaign.controller';
import { EmailAnalyticController } from './controllers/email-analytic.controller';

@Module({
  imports: [InfrastructureModule, DomainModule],
  controllers: [
    EmailTemplateController,
    EmailCampaignController,
    EmailAnalyticController,
  ],
  providers: [EmailTemplateExistsRule],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}