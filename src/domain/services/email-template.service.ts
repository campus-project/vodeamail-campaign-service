import { HttpStatus, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';

import * as _ from 'lodash';

import { EmailTemplate } from '../entities/email-template.entity';
import { CreateEmailTemplateDto } from '../../application/dtos/email-template/create-email-template.dto';
import { UpdateEmailTemplateDto } from '../../application/dtos/email-template/update-email-template.dto';
import { FindEmailTemplateDto } from '../../application/dtos/email-template/find-email-template.dto';
import { DeleteEmailTemplateDto } from '../../application/dtos/email-template/delete-email-template.dto';
import { EmailTemplateIdExistsDto } from '../../application/dtos/email-template/email-template-id-exists.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const {
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor,
    } = createEmailTemplateDto;

    const data = await this.emailTemplateRepository.save({
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
    findAllEmailTemplateDto: FindEmailTemplateDto,
  ): Promise<EmailTemplate[]> {
    const { id, ids, organization_id } = findAllEmailTemplateDto;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    return await this.emailTemplateRepository.find({
      where: {
        organization_id: organization_id,
        ...(id || ids ? { id: In(filteredIds) } : {}),
      },
    });
  }

  async findOne(
    findOneEmailTemplateDto: FindEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const data = await this.findAll(findOneEmailTemplateDto);
    return _.head(data);
  }

  async update(
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const {
      id,
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor,
    } = updateEmailTemplateDto;

    const data = await this.emailTemplateRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

    if (!data) {
      throw new RpcException(
        JSON.stringify({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Count not find resource ${id}.`,
          error: 'Not Found',
        }),
      );
    }

    await this.emailTemplateRepository.save({
      ...data,
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
    deleteEmailTemplateDto: DeleteEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const { id, is_hard, organization_id, actor } = deleteEmailTemplateDto;

    const data = await this.emailTemplateRepository.findOne({
      where: {
        id,
        organization_id,
      },
    });

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
      await this.emailTemplateRepository.remove(data);
    } else {
      await this.emailTemplateRepository.save({
        ...data,
        deleted_by: actor,
        deleted_at: new Date().toISOString(),
      });
    }

    return data;
  }

  async idExists(roleIdExistsDto: EmailTemplateIdExistsDto): Promise<boolean> {
    const { id, organization_id } = roleIdExistsDto;
    return (
      (await this.emailTemplateRepository.count({
        where: { id, organization_id },
      })) > 0
    );
  }
}
