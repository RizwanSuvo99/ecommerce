import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EmailSettingsDto {
  @IsString()
  smtpHost: string;

  @IsNumber()
  smtpPort: number;

  @IsString()
  smtpUser: string;

  @IsString()
  smtpPass: string;

  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean = true;

  @IsEmail()
  fromEmail: string;

  @IsString()
  fromName: string;

  @IsOptional()
  @IsEmail()
  replyToEmail?: string;

  @IsOptional()
  @IsBoolean()
  orderConfirmation?: boolean = true;

  @IsOptional()
  @IsBoolean()
  shippingNotification?: boolean = true;

  @IsOptional()
  @IsBoolean()
  welcomeEmail?: boolean = true;
}
