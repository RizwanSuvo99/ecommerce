import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum RefundType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export class RefundDto {
  @IsEnum(RefundType)
  type: RefundType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  amountBDT?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
