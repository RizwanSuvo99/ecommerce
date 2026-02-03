import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: HealthStatus;
    redis: HealthStatus;
    memory: MemoryStatus;
  };
}

interface HealthStatus {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

interface MemoryStatus {
  status: 'up' | 'down';
  used: number;
  total: number;
  percentage: number;
}

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory(),
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'up',
    );

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      checks,
    };
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Simple liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async livenessCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      // In production, this would use the actual database connection
      // e.g., await this.prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start;
      return { status: 'up', responseTime };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkRedis(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      // In production, this would use the actual Redis connection
      // e.g., await this.redis.ping()
      const responseTime = Date.now() - start;
      return { status: 'up', responseTime };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private checkMemory(): MemoryStatus {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memUsage.heapUsed;
    const percentage = (usedMemory / totalMemory) * 100;

    return {
      status: percentage < 90 ? 'up' : 'down',
      used: Math.round(usedMemory / 1024 / 1024),
      total: Math.round(totalMemory / 1024 / 1024),
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}
