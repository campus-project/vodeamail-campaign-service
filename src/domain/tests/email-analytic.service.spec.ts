import { Test, TestingModule } from '@nestjs/testing';
import { EmailAnalyticService } from '../services/email-analytic.service';

describe('EmailAnalyticService', () => {
  let service: EmailAnalyticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailAnalyticService],
    }).compile();

    service = module.get<EmailAnalyticService>(EmailAnalyticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
