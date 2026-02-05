import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * Coupon discount type.
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

/**
 * DTO for creating a new coupon.
 * All monetary values are in BDT (৳).
 */
export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  /**
   * Discount value.
   * - For PERCENTAGE: value between 1-100
   * - For FIXED_AMOUNT: value in BDT (৳)
   */
  @IsNumber()
  @Min(0)
  discountValue!: number;

  /**
   * Minimum order amount in BDT (৳) required to use this coupon.
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumOrderAmount?: number;

  /**
   * Maximum discount amount in BDT (৳).
   * Only applicable for PERCENTAGE type coupons.
   */
  @IsNumber()
  @IsOptional()
  @Min(0)
  maximumDiscount?: number;

  /**
   * Maximum number of times this coupon can be used in total.
   */
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  /**
   * Maximum number of times a single user can use this coupon.
   */
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimitPerUser?: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
