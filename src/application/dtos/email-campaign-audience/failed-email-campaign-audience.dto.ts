import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FailedEmailCampaignAudienceDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @IsNotEmpty()
  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsString()
  failed: string;
}
