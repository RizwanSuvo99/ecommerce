import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';

export enum BulkProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

/**
 * DTO for bulk status update of products.
 */
export class BulkUpdateStatusDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  productIds: string[];

  @IsEnum(BulkProductStatus)
  status: BulkProductStatus;
}

/**
 * DTO for bulk deletion of products.
 * Supports both soft delete (archive) and permanent delete.
 */
export class BulkDeleteDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  productIds: string[];
}

/**
 * DTO for bulk category assignment.
 */
export class BulkAssignCategoryDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  productIds: string[];

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
