import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import * as _ from 'lodash';

import { EmailCampaign } from '../entities/email-campaign.entity';
import { FindEmailAnalyticDto } from '../../application/dtos/email-analytic/find-email-analytic.dto';

@Injectable()
export class EmailAnalyticService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly emailAnalyticRepository: Repository<EmailCampaign>,
  ) {}

  async findAll(
    findAllEmailAnalyticDto: FindEmailAnalyticDto,
  ): Promise<EmailCampaign[]> {
    const { id, ids, organization_id } = findAllEmailAnalyticDto;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    return await this.emailAnalyticRepository.find({
      where: {
        organization_id: organization_id,
        ...(id || ids ? { id: In(filteredIds) } : {}),
      },
    });
  }

  async findOne(
    findOneEmailAnalyticDto: FindEmailAnalyticDto,
  ): Promise<EmailCampaign> {
    const data = await this.findAll(findOneEmailAnalyticDto);
    return _.head(data);
  }
}
