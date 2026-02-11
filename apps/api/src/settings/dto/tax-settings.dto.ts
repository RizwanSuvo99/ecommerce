import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class TaxSettingsDto {
  @IsBoolean()
  enableTax: boolean;

  @IsNumber()
  vatRate: number = 15; // Bangladesh standard VAT 15%

  @IsOptional()
  @IsBoolean()
  priceIncludesTax?: boolean = true;

  @IsOptional()
  @IsString()
  taxRegistrationNumber?: string; // BIN number

  @IsOptional()
  @IsBoolean()
  showTaxBreakdown?: boolean = true;

  @IsOptional()
  @IsString()
  taxLabel?: string = 'VAT';
}
