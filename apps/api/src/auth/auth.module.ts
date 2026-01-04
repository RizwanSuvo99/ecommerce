import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SocialAuthService } from './social-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super-secret-key-change-in-production'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
          issuer: 'ecommerce-api',
          audience: 'ecommerce-client',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SocialAuthService, JwtStrategy, PrismaService],
  exports: [AuthService, SocialAuthService, JwtModule, PassportModule],
})
export class AuthModule {}
