import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class OpenedEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
}
