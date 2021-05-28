import { Module } from '@nestjs/common';

import { EmailTemplateExistsRule } from './rules/email-template-exists.rule';
import { GroupExistsRule } from './rules/group-exists.rule';

import { DomainModule } from '../domain/domain.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailTemplateController } from './controllers/email-template.controller';
import { EmailCampaignController } from './controllers/email-campaign.controller';
import { EmailAnalyticController } from './controllers/email-analytic.controller';
import { EmailCampaignAnalyticController } from './controllers/email-campaign-analytic.controller';

@Module({
  imports: [InfrastructureModule, DomainModule],
  controllers: [
    EmailTemplateController,
    EmailCampaignController,
    EmailAnalyticController,
    EmailCampaignAnalyticController,
  ],
  providers: [EmailTemplateExistsRule, GroupExistsRule],
  exports: [InfrastructureModule, DomainModule],
})
export class ApplicationModule {}
