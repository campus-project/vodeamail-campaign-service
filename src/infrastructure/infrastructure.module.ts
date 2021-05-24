import { Module, Provider } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

const providers: Provider[] = [
  {
    provide: 'CLIENT_KAFKA',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) =>
      ClientProxyFactory.create({
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId:
              configService.get<string>('KAFKA_CLIENT_ID') ||
              'audience-service',
            brokers: [
              configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
            ],
          },
          consumer: {
            groupId:
              configService.get<string>('KAFKA_CONSUMER_GROUP_ID') ||
              'audience-service-consumer',
          },
        },
      }),
  },
];

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  providers: [...providers],
  exports: [...providers],
})
export class InfrastructureModule {}
