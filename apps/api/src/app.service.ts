import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  uptime: number;
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealthCheck(): HealthCheckResponse {
    return {
      status: 'ok',
      service: '@ecommerce/api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      uptime: process.uptime(),
    };
  }
}
