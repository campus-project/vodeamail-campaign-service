import { Module, Provider } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

const providers: Provider[] = [
  {
    provide: 'ACCOUNT_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('ACCOUNT_SERVICE_HOST'),
          port: configService.get<number>('ACCOUNT_SERVICE_PORT'),
        },
      }),
  },
  {
    provide: 'AUDIENCE_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('AUDIENCE_SERVICE_HOST'),
          port: configService.get<number>('AUDIENCE_SERVICE_PORT'),
        },
      }),
  },
  {
    provide: 'MAILER_SERVICE',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('MAILER_SERVICE_HOST'),
          port: configService.get<number>('MAILER_SERVICE_PORT'),
        },
      }),
  },
];

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule],
  providers: [...providers],
  exports: [...providers],
})
export class InfrastructureModule {}
