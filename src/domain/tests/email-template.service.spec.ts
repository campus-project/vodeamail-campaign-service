import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplateService } from '../services/email-template.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from '../entities/email-template.entity';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        InfrastructureModule,
        TypeOrmModule.forFeature([EmailTemplate]),
      ],
      providers: [EmailTemplateService],
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
