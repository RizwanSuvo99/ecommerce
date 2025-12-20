import { IsNotEmpty, IsString } from 'class-validator';

export class FacebookAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Facebook access token is required' })
  accessToken!: string;
}
