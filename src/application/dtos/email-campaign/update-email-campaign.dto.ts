import { CreateEmailCampaignDto } from './create-email-campaign.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateEmailCampaignDto extends CreateEmailCampaignDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}
