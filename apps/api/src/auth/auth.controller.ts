import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Register a new user account.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Registration successful. Please verify your email address.',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }
}
