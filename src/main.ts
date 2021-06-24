import { NestFactory, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import { AppModule } from './app.module';
import { ExceptionRpcFilter } from './@core/filters/exception-rpc.filter';
import { ValidationRpcPipe } from './@core/pipes/validation-rpc.pipe';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

(async () => {
  const configService = new ConfigService();
  const logger = new Logger('Main');

  const appHost = configService.get<string>('APP_HOST');
  const appPort = configService.get<number>('APP_PORT');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: appHost,
        port: appPort,
      },
    },
  );

  //is used for transform pipes message
  app.useGlobalPipes(
    new ValidationRpcPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  // is use for transform exception to rpc exception
  app.useGlobalFilters(new ExceptionRpcFilter());

  //is used for exclude attribute in entity
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  //is used for allow custom pipes attribute
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(() => {
    logger.log(`Microservice is listening on ${appHost}:${appPort}`);
  });
})();
