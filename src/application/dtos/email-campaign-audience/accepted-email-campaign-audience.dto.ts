import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class AcceptedEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
}
