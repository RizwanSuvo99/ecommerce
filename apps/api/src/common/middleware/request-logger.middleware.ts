import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../logger/logger.service';

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  contentLength: string | undefined;
  correlationId: string;
  userAgent: string | undefined;
  ip: string | undefined;
  userId?: string;
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Generate or extract correlation ID
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    // Attach correlation ID to request and response
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    res.setHeader('X-Request-ID', correlationId);

    // Log incoming request
    this.logger.debug(`Incoming ${req.method} ${req.originalUrl}`, {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
      referer: req.headers.referer,
    });

    // Capture response finish event
    const originalEnd = res.end;
    const self = this;

    res.end = function (
      this: Response,
      ...args: Parameters<Response['end']>
    ): ReturnType<Response['end']> {
      const responseTime = Date.now() - startTime;

      const metrics: RequestMetrics = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        contentLength: res.getHeader('content-length') as string | undefined,
        correlationId,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.socket.remoteAddress,
        userId: (req as Record<string, unknown>).userId as string | undefined,
      };

      // Log based on status code
      if (res.statusCode >= 500) {
        self.logger.error(
          `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`,
          undefined,
          'HTTP',
        );
        self.logMetrics(metrics, 'error');
      } else if (res.statusCode >= 400) {
        self.logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`, {
          ...metrics,
        });
      } else {
        self.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`, {
          ...metrics,
        });
      }

      // Log slow requests
      if (responseTime > 3000) {
        self.logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${responseTime}ms`, {
          correlationId,
          responseTime,
          threshold: 3000,
        });
      }

      return originalEnd.apply(this, args);
    };

    next();
  }

  private logMetrics(metrics: RequestMetrics, level: string): void {
    this.logger.event('http_request', {
      level,
      ...metrics,
    });
  }
}

/**
 * Extract correlation ID from the current request
 */
export function getCorrelationId(req: Request): string {
  return (req.headers['x-correlation-id'] as string) || 'unknown';
}

/**
 * Skip logging for specific paths (health checks, static assets)
 */
export function shouldSkipLogging(url: string): boolean {
  const skipPaths = [
    '/api/health',
    '/api/healthz',
    '/favicon.ico',
    '/_next/',
    '/static/',
  ];

  return skipPaths.some((path) => url.startsWith(path));
}
