import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class ClickedEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
}
