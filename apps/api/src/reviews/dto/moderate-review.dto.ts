import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ModerateReviewDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class AdminReviewQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}

export class AdminReviewResponseDto {
  @IsString()
  response: string;
}
