import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingZoneDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  divisions: string[];

  @IsNumber()
  flatRate: number; // BDT ৳

  @IsOptional()
  @IsNumber()
  freeAbove?: number; // Free shipping threshold in BDT

  @IsOptional()
  @IsNumber()
  estimatedDays?: number;
}

export class ShippingMethodDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsNumber()
  baseCost?: number;
}

export class ShippingSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingMethodDto)
  methods: ShippingMethodDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingZoneDto)
  zones: ShippingZoneDto[];

  @IsOptional()
  @IsBoolean()
  enableFreeShipping?: boolean;

  @IsOptional()
  @IsNumber()
  freeShippingThreshold?: number; // BDT ৳
}
