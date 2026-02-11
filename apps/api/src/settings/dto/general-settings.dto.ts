import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class GeneralSettingsDto {
  @IsString()
  @MaxLength(120)
  siteNameEn: string;

  @IsString()
  @MaxLength(120)
  siteNameBn: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @IsString()
  currency: string = 'BDT';

  @IsString()
  currencySymbol: string = '৳';

  @IsString()
  locale: string = 'bn-BD';

  @IsOptional()
  @IsString()
  timezone?: string = 'Asia/Dhaka';

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
