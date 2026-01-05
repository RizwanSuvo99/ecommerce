import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
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
 * For authenticated users: `addressId` is required (saved address).
 * For guests: `addressId` is omitted; inline shipping fields + guest contact are required.
 *
 * POST /checkout/validate
 */
export class CheckoutDto {
  /** ID of the shipping address (required for authenticated users, optional for guests) */
  @IsString()
  @IsOptional()
  addressId?: string;

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

  // ─── Guest contact info ──────────────────────────────────

  @IsString()
  @IsOptional()
  guestFullName?: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  // ─── Inline shipping address (for guests) ────────────────

  @IsString()
  @IsOptional()
  shippingFullName?: string;

  @IsString()
  @IsOptional()
  shippingPhone?: string;

  @IsString()
  @IsOptional()
  shippingAddressLine1?: string;

  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @IsString()
  @IsOptional()
  shippingDivision?: string;

  @IsString()
  @IsOptional()
  shippingDistrict?: string;

  @IsString()
  @IsOptional()
  shippingArea?: string;

  @IsString()
  @IsOptional()
  shippingPostalCode?: string;
}
