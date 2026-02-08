import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  titleBn?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  contentBn?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaTitleBn?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaDescriptionBn?: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus = PageStatus.DRAFT;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  template?: string;
}
