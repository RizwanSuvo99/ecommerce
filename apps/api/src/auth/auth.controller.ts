import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

  /**
   * POST /auth/login
   * Authenticate user with email and password.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip;

    const result = await this.authService.login(dto, ipAddress);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }
}
