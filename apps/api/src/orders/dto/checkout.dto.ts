import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

/**
 * Supported payment methods for checkout.
 */
export enum PaymentMethod {
  CARD = 'CARD',
  COD = 'COD',
  BKASH = 'BKASH',
}

/**
 * DTO for validating checkout data before order creation.
 *
 * POST /checkout/validate
 */
export class CheckoutDto {
  /** ID of the shipping address to deliver to */
  @IsString()
  @IsNotEmpty()
  addressId: string;

  /** Selected shipping method identifier */
  @IsString()
  @IsNotEmpty()
  shippingMethodId: string;

  /** Payment method to use */
  @IsEnum(PaymentMethod, {
    message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  /** Optional coupon code to apply */
  @IsString()
  @IsOptional()
  couponCode?: string;
}
