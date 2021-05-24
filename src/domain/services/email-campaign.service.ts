import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

import * as _ from 'lodash';

import { EmailCampaign } from '../entities/email-campaign.entity';
import { CreateEmailCampaignDto } from '../../application/dtos/email-campaign/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../../application/dtos/email-campaign/update-email-campaign.dto';
import { FindEmailCampaignDto } from '../../application/dtos/email-campaign/find-email-campaign.dto';
import { DeleteEmailCampaignDto } from '../../application/dtos/email-campaign/delete-email-campaign.dto';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly emailCampaignRepository: Repository<EmailCampaign>,
  ) {}

  async create(
    createEmailCampaignDto: CreateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const {
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor,
    } = createEmailCampaignDto;

    const data = await this.emailCampaignRepository.save({
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      created_by: actor,
      updated_by: actor,
    });

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async findAll(
    findAllEmailCampaignDto: FindEmailCampaignDto,
  ): Promise<EmailCampaign[]> {
    const { id, ids, organization_id } = findAllEmailCampaignDto;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    return await this.emailCampaignRepository.find({
      where: {
        organization_id: organization_id,
        ...(id || ids ? { id: In(filteredIds) } : {}),
      },
    });
  }

  async findOne(
    findOneEmailCampaignDto: FindEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const data = await this.findAll(findOneEmailCampaignDto);
    return _.head(data);
  }

  async update(
    updateEmailCampaignDto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const {
      id,
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor,
    } = updateEmailCampaignDto;

    const data = await this.emailCampaignRepository.findOne({ id });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    await this.emailCampaignRepository.save({
      ...data,
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor,
      updated_by: actor,
    });

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async remove(
    deleteEmailCampaignDto: DeleteEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const { id, is_hard, actor } = deleteEmailCampaignDto;

    const data = await this.emailCampaignRepository.findOne({ id });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    if (is_hard) {
      await this.emailCampaignRepository.remove(data);
    } else {
      await this.emailCampaignRepository.save({
        ...data,
        deleted_by: actor,
        deleted_at: new Date().toISOString(),
      });
    }

    return data;
  }
}
