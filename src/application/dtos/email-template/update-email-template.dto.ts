import { CreateEmailTemplateDto } from './create-email-template.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
