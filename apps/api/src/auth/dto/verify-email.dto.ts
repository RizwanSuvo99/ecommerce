import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyEmailDto {
  @IsString({ message: 'Verification token must be a string' })
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
