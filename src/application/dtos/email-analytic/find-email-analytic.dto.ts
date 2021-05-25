import { IsArray, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FindEmailAnalyticDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;

  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  ids?: string[];
}
