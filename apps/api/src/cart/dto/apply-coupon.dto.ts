import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for applying a coupon/discount code to the cart.
 */
export class ApplyCouponDto {
  /** Coupon code to apply */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;
}
