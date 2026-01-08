import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  Matches,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for updating an existing brand.
 * All fields are optional - only provided fields will be updated.
 */
export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  nameBn?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only (e.g., "samsung-electronics")',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  coverImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
