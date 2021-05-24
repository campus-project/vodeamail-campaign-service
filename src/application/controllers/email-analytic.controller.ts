import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { EmailAnalyticService } from '../../domain/services/email-analytic.service';
import { FindEmailAnalyticDto } from '../dtos/email-analytic/find-email-analytic.dto';

@Controller()
export class EmailAnalyticController {
  constructor(
    @Inject('EMAIL_ANALYTIC_SERVICE')
    private readonly emailAnalyticService: EmailAnalyticService,
  ) {}

  @MessagePattern('findAllEmailAnalytic')
  findAll(@Payload('value') findEmailAnalytic: FindEmailAnalyticDto) {
    return this.emailAnalyticService.findAll(findEmailAnalytic);
  }

  @MessagePattern('findOneEmailAnalytic')
  findOne(@Payload('value') findEmailAnalytic: FindEmailAnalyticDto) {
    return this.emailAnalyticService.findOne(findEmailAnalytic);
  }
}
