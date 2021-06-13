import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from 'class-validator';
import { GroupExistsRule } from '../../rules/group-exists.rule';
import { EmailTemplateExistsRule } from '../../rules/email-template-exists.rule';

export class CreateEmailCampaignDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  from_name: string;

  @IsNotEmpty()
  @MaxLength(15)
  from: string;

  @IsNotEmpty()
  @IsString()
  domain: string;

  @IsNotEmpty()
  @IsDateString()
  send_at: string;

  @IsNotEmpty()
  @IsBoolean()
  is_directly_send: boolean;

  @IsNotEmpty()
  @IsUUID('4')
  @Validate(EmailTemplateExistsRule)
  email_template_id: string;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  @Validate(GroupExistsRule, { each: true })
  group_ids: string[];

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
