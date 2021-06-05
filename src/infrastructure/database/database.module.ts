import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { EmailCampaign } from '../../domain/entities/email-campaign.entity';
import { EmailTemplate } from '../../domain/entities/email-template.entity';
import { EmailCampaignGroup } from '../../domain/entities/email-campaign-group.entity';
import { EmailCampaignAudience } from '../../domain/entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from '../../domain/entities/email-campaign-analytic.entity';
import { SummaryEmailCampaignView } from '../../domain/views/summary-email-campaign.view';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') || '127.0.0.1',
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME') || 'root',
        password: configService.get<string>('DB_PASSWORD') || 'secret',
        database:
          configService.get<string>('DB_DATABASE') ||
          'vodeamail-campaign-service',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        dropSchema: false,
        logging: false,
        entities: [
          EmailTemplate,
          EmailCampaign,
          EmailCampaignGroup,
          EmailCampaignAudience,
          EmailCampaignAnalytic,
          SummaryEmailCampaignView
        ],
        timezone: 'UTC',
      }),
    }),
  ],
})
export class DatabaseModule {}
