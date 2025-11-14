import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsBoolean()
  email_opt_in?: boolean;

  @IsOptional()
  @IsBoolean()
  push_opt_in?: boolean;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsNumber()
  rate_limit_per_min?: number;
}
