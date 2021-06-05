import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientKafka, RpcException } from '@nestjs/microservices';

import * as _ from 'lodash';
import { v4 } from 'uuid';

import { EmailCampaign } from '../entities/email-campaign.entity';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { CreateEmailCampaignDto } from '../../application/dtos/email-campaign/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../../application/dtos/email-campaign/update-email-campaign.dto';
import { FindEmailCampaignDto } from '../../application/dtos/email-campaign/find-email-campaign.dto';
import { DeleteEmailCampaignDto } from '../../application/dtos/email-campaign/delete-email-campaign.dto';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';

@Injectable()
export class EmailCampaignService {
  constructor(
    @Inject('CLIENT_KAFKA')
    private readonly clientKafka: ClientKafka,
    @InjectRepository(EmailCampaign)
    private readonly emailCampaignRepository: Repository<EmailCampaign>,
    @InjectRepository(EmailCampaignGroup)
    private readonly emailCampaignGroupRepository: Repository<EmailCampaignGroup>,
    @InjectRepository(EmailCampaignAudience)
    private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  onModuleInit() {
    const patterns = ['findAllGroup', 'findAllContact'];
    for (const pattern of patterns) {
      this.clientKafka.subscribeToResponseOf(pattern);
    }
  }

  async create(
    createEmailCampaignDto: CreateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const {
      organization_id,
      name,
      subject,
      from_name,
      from,
      send_at,
      is_directly_send,
      email_template_id,
      group_ids,
      actor,
    } = createEmailCampaignDto;

    const emailTemplate = await this.emailTemplateRepository.findOne({
      id: email_template_id,
    });

    const data = await this.emailCampaignRepository.save({
      organization_id,
      name,
      subject,
      from_name,
      from,
      domain: 'vodeacloud.com',
      send_at,
      is_directly_send,
      email_template_id,
      email_template_html: emailTemplate.html,
      email_template_design: emailTemplate.design,
      email_template_example_value_tags: emailTemplate.example_value_tags,
      email_template_image_url: emailTemplate.image_url,
      created_by: actor,
      updated_by: actor,
    });

    await this.syncGroup(data, group_ids);

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async findAll(
    findAllEmailCampaignDto: FindEmailCampaignDto,
  ): Promise<EmailCampaign[]> {
    const { organization_id, relations } = findAllEmailCampaignDto;
    const data = await this.findQueryBuilder(findAllEmailCampaignDto).getMany();

    if (relations === undefined || relations.length == 0) {
      return data;
    }

    const emailCampaignIds = [];
    const mapEmailCampaignGroups = {};

    const relationValues = {
      groups: undefined,
    };

    data.forEach((emailCampaignId) => {
      emailCampaignIds.push(emailCampaignId.id);
    });

    if (relations.includes('groups')) {
      const emailCampaignGroups = await this.emailCampaignGroupRepository.find({
        where: { email_campaign_id: In(emailCampaignIds) },
      });

      const groupIds = [];
      emailCampaignGroups.forEach((emailCampaignGroup) => {
        if (
          typeof mapEmailCampaignGroups[
            emailCampaignGroup.email_campaign_id
          ] === 'undefined'
        ) {
          mapEmailCampaignGroups[emailCampaignGroup.email_campaign_id] = [];
        }

        mapEmailCampaignGroups[emailCampaignGroup.email_campaign_id].push(
          emailCampaignGroup.group_id,
        );

        groupIds.push(emailCampaignGroup.group_id);
      });

      relationValues.groups = await this.clientKafka
        .send('findAllGroup', {
          ids: groupIds,
          organization_id,
        })
        .toPromise();
    }

    return data.map((emailCampaign) => {
      if (relationValues.groups !== undefined) {
        let groups = [];

        if (mapEmailCampaignGroups[emailCampaign.id] !== undefined) {
          const listGroupIds = mapEmailCampaignGroups[emailCampaign.id];
          if (Array.isArray(listGroupIds) && listGroupIds.length) {
            groups = relationValues.groups.filter((group) =>
              listGroupIds.includes(group.id),
            );
          }
        }

        Object.assign(emailCampaign, {
          groups,
        });
      }

      return emailCampaign;
    });
  }

  async findAllCount(
    findAllCountEmailCampaignDto: FindEmailCampaignDto,
  ): Promise<number> {
    return await this.findQueryBuilder(findAllCountEmailCampaignDto).getCount();
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
      subject,
      from_name,
      from,
      send_at,
      is_directly_send,
      email_template_id,
      group_ids,
      actor,
    } = updateEmailCampaignDto;

    const data = await this.emailCampaignRepository.findOne({
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

    const emailTemplate = await this.emailTemplateRepository.findOne({
      id: email_template_id,
    });

    await this.emailCampaignRepository.save({
      ...data,
      name,
      subject,
      from_name,
      from,
      domain: 'vodeacloud.com',
      send_at,
      is_directly_send,
      email_template_id,
      email_template_html: emailTemplate.html,
      email_template_design: emailTemplate.design,
      email_template_example_value_tags: emailTemplate.example_value_tags,
      email_template_image_url: emailTemplate.image_url,
      updated_by: actor,
    });

    await this.syncGroup(data, group_ids);

    return await this.findOne({
      id: data.id,
      organization_id: data.organization_id,
    });
  }

  async remove(
    deleteEmailCampaignDto: DeleteEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const { id, is_hard, organization_id, actor } = deleteEmailCampaignDto;

    const data = await this.emailCampaignRepository.findOne({
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

  protected async syncGroup(
    emailCampaign: EmailCampaign,
    groupIds: string[],
  ): Promise<void> {
    const groups = groupIds.length
      ? await this.clientKafka
          .send('findAllGroup', {
            ids: groupIds,
            organization_id: emailCampaign.organization_id,
          })
          .toPromise()
      : [];

    const realGroupIds = groups.map((group) => group.id);
    const currentEmailCampaignGroups =
      await this.emailCampaignGroupRepository.find({
        where: {
          email_campaign_id: emailCampaign.id,
        },
      });

    await this.emailCampaignGroupRepository.remove(
      currentEmailCampaignGroups.filter(
        (emailCampaignGroup) =>
          !realGroupIds.includes(emailCampaignGroup.group_id),
      ),
    );

    for (const group of groups) {
      if (
        currentEmailCampaignGroups.findIndex(
          (emailCampaignGroup) => emailCampaignGroup.group_id === group.id,
        ) === -1
      )
        await this.emailCampaignGroupRepository.save({
          email_campaign: emailCampaign,
          group_id: group.id,
        });
    }

    const contacts = realGroupIds.length
      ? await this.clientKafka
          .send('findAllContact', {
            group_ids: realGroupIds,
            organization_id: emailCampaign.organization_id,
            is_subscribed: true,
          })
          .toPromise()
      : [];

    const realContactIds = contacts.map((contact) => contact.id);
    const currentEmailCampaignAudiences =
      await this.emailCampaignAudienceRepository.find({
        where: {
          email_campaign_id: emailCampaign.id,
        },
      });

    await this.emailCampaignAudienceRepository.remove(
      currentEmailCampaignAudiences.filter(
        (emailCampaignAudience) =>
          !realContactIds.includes(emailCampaignAudience.contact_id),
      ),
    );

    for (const contact of contacts) {
      if (
        currentEmailCampaignAudiences.findIndex(
          (emailCampaignAudience) =>
            emailCampaignAudience.contact_id === contact.id,
        ) === -1
      ) {
        if (contact.is_subscribed) {
          const emailCampaignAudienceId = v4();
          await this.emailCampaignAudienceRepository.save({
            id: emailCampaignAudienceId,
            email_campaign: emailCampaign,
            contact_id: contact.id,
            to: contact.email,
            to_name: contact.name,
            value_tags: JSON.stringify({}),
            html: emailCampaign.email_template_html,
          });
        }
      }
    }
  }

  findQueryBuilder(
    params: FindEmailCampaignDto,
  ): SelectQueryBuilder<EmailCampaign> {
    const {
      id,
      ids,
      organization_id,
      search,
      per_page,
      page = 1,
      order_by,
      sorted_by = 'ASC',
      relations,
    } = params;

    const filteredIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      filteredIds.push(id);
    }

    let qb = this.emailCampaignRepository
      .createQueryBuilder('email_campaign')
      .innerJoinAndSelect('email_campaign.summary', 'summary')
      .where((qb) => {
        qb.where({
          organization_id: organization_id,
          ...(id || ids ? { id: In(filteredIds) } : {}),
        });

        if (search !== undefined) {
          const params = { search: `%${search}%` };

          qb.andWhere(
            new Brackets((q) => {
              q.where('email_campaign.name LIKE :search', params)
                .orWhere('email_campaign.subject LIKE :search', params)
                .orWhere('email_campaign.from LIKE :search', params)
                .orWhere('email_campaign.from_name LIKE :search', params)
                .orWhere(
                  'CONCAT(email_campaign.from, "@", email_campaign.domain) LIKE :search',
                  params,
                );
            }),
          );
        }
      });

    if (relations !== undefined) {
      if (relations.includes('email_template')) {
        qb = qb.leftJoinAndSelect(
          'email_campaign.email_template',
          'email_template',
        );
      }
    }

    if (per_page !== undefined) {
      qb = qb.take(per_page).skip(page > 1 ? per_page * (page - 1) : 0);
    }

    if (order_by !== undefined) {
      qb = qb.orderBy(
        order_by,
        ['desc'].includes(sorted_by.toLowerCase()) ? 'DESC' : 'ASC',
      );
    }

    return qb;
  }
}
