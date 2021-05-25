import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class UnsubscribeEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
}
