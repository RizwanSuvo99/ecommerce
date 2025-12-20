import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Firebase ID token is required' })
  idToken!: string;
}
