import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableStripe?: boolean;

  @IsOptional()
  @IsString()
  stripePublicKey?: string;

  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  @IsBoolean()
  enableCOD: boolean = true;

  @IsOptional()
  @IsNumber()
  codExtraCharge?: number = 0; // BDT ৳

  @IsOptional()
  @IsNumber()
  bdtToUsdRate?: number; // For Stripe international payments

  @IsOptional()
  @IsBoolean()
  enableBkash?: boolean;

  @IsOptional()
  @IsBoolean()
  enableNagad?: boolean;
}
