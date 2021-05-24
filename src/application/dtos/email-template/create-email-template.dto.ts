import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  design: string;

  @IsNotEmpty()
  @IsString()
  html: string;

  @IsNotEmpty()
  @IsString()
  example_value_tags: string;

  @IsNotEmpty()
  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsUUID('4')
  actor?: string;
}
