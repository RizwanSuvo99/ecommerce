import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SeoSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitleBn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescriptionBn?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  fbPixelId?: string;

  @IsOptional()
  @IsString()
  robotsTxt?: string;

  @IsOptional()
  @IsString()
  sitemapUrl?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsString()
  structuredData?: string;
}
