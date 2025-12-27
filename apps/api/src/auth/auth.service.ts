import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh-super-secret-key-change-in-production',
    );
    this.refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    this.bcryptSaltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

  /**
   * Generate access and refresh token pair for a user.
   */
  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user account.
   */
  async register(dto: RegisterDto) {
    const { email, password, firstName, lastName, phone, acceptTerms } = dto;

    if (!acceptTerms) {
      throw new BadRequestException('You must accept the terms and conditions');
    }

    // Check if the email is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);

    // Generate email verification token
    const verifyToken = randomBytes(32).toString('hex');
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        verifyToken,
        verifyTokenExp,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Generate authentication tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store the hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    this.logger.log(`New user registered: ${user.email}`);

    // TODO: Send verification email via email service

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Authenticate a user with email and password.
   */
  async login(dto: LoginDto, ipAddress?: string) {
    const { email, password, rememberMe } = dto;

    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if the account is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens (extend refresh token for "remember me")
    const tokens = rememberMe
      ? {
          ...(await this.generateTokens(user.id, user.email, user.role)),
        }
      : await this.generateTokens(user.id, user.email, user.role);

    // Store the hashed refresh token and update last login
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    });

    this.logger.log(`User logged in: ${user.email}`);

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access and refresh tokens using a valid refresh token.
   * Implements token rotation for enhanced security.
   */
  async refreshTokens(dto: RefreshTokenDto) {
    const { refreshToken } = dto;

    // Verify the refresh token
    let payload: { sub: string; email: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    // Find the user and their stored refresh token
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        refreshToken: true,
        createdAt: true,
      },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied - user not found or token revoked');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is deactivated or suspended');
    }

    // Verify the refresh token matches the stored hash (revocation check)
    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isTokenValid) {
      // Possible token reuse attack - revoke all tokens for this user
      this.logger.warn(
        `Potential refresh token reuse detected for user: ${user.email}`,
      );
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      throw new ForbiddenException('Token has been revoked. Please login again.');
    }

    // Rotate tokens - generate a new pair
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store the new hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    this.logger.debug(`Tokens refreshed for user: ${user.email}`);

    const { refreshToken: _, ...userWithoutToken } = user;

    return {
      user: userWithoutToken,
      ...tokens,
    };
  }
}
