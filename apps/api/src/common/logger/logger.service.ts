import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

interface LogContext {
  [key: string]: unknown;
}

interface PinoLoggerOptions {
  level: string;
  transport?: {
    target: string;
    options: Record<string, unknown>;
  };
  redact: {
    paths: string[];
    censor: string;
  };
  serializers: Record<string, (value: unknown) => unknown>;
  base: Record<string, unknown>;
  timestamp: () => string;
  formatters: {
    level: (label: string) => { level: string };
  };
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly isProduction: boolean;
  private readonly logLevel: string;
  private context: string = 'Application';

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug');
  }

  /**
   * Get Pino configuration for the logger
   */
  getPinoConfig(): PinoLoggerOptions {
    const baseConfig: PinoLoggerOptions = {
      level: this.logLevel,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'body.password',
          'body.confirmPassword',
          'body.currentPassword',
          'body.newPassword',
          'body.token',
          'body.refreshToken',
          'body.creditCard',
          'body.cardNumber',
          'body.cvv',
          'body.ssn',
          'user.password',
          'user.hashedPassword',
        ],
        censor: '[REDACTED]',
      },
      serializers: {
        req: (req: unknown) => {
          const request = req as Record<string, unknown>;
          return {
            id: request.id,
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
            remoteAddress: (request.raw as Record<string, unknown>)?.ip,
            userAgent: (request.headers as Record<string, unknown>)?.['user-agent'],
          };
        },
        res: (res: unknown) => {
          const response = res as Record<string, unknown>;
          return {
            statusCode: response.statusCode,
          };
        },
        err: (err: unknown) => {
          const error = err as Record<string, unknown>;
          return {
            type: (error.constructor as Function)?.name || 'Error',
            message: error.message,
            stack: error.stack,
            code: error.code,
          };
        },
      },
      base: {
        service: 'ecommerce-api',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      formatters: {
        level: (label: string) => ({ level: label }),
      },
    };

    // Pretty printing for development
    if (!this.isProduction) {
      baseConfig.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{context} - {msg}',
        },
      };
    }

    return baseConfig;
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string | LogContext): void {
    const ctx = typeof context === 'string' ? context : this.context;
    const meta = typeof context === 'object' ? context : {};
    if (this.isProduction) {
      console.log(JSON.stringify({ level: 'info', context: ctx, msg: message, ...meta, time: new Date().toISOString() }));
    } else {
      console.log(`[${ctx}] ${message}`, Object.keys(meta).length ? meta : '');
    }
  }

  error(message: string, trace?: string, context?: string): void {
    const ctx = context || this.context;
    if (this.isProduction) {
      console.error(JSON.stringify({ level: 'error', context: ctx, msg: message, trace, time: new Date().toISOString() }));
    } else {
      console.error(`[${ctx}] ERROR: ${message}`);
      if (trace) console.error(trace);
    }
  }

  warn(message: string, context?: string | LogContext): void {
    const ctx = typeof context === 'string' ? context : this.context;
    const meta = typeof context === 'object' ? context : {};
    if (this.isProduction) {
      console.warn(JSON.stringify({ level: 'warn', context: ctx, msg: message, ...meta, time: new Date().toISOString() }));
    } else {
      console.warn(`[${ctx}] WARN: ${message}`, Object.keys(meta).length ? meta : '');
    }
  }

  debug(message: string, context?: string | LogContext): void {
    if (this.isProduction) return;
    const ctx = typeof context === 'string' ? context : this.context;
    const meta = typeof context === 'object' ? context : {};
    console.debug(`[${ctx}] DEBUG: ${message}`, Object.keys(meta).length ? meta : '');
  }

  verbose(message: string, context?: string | LogContext): void {
    if (this.isProduction) return;
    const ctx = typeof context === 'string' ? context : this.context;
    const meta = typeof context === 'object' ? context : {};
    console.log(`[${ctx}] VERBOSE: ${message}`, Object.keys(meta).length ? meta : '');
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: LogContext): LoggerService {
    const childLogger = new LoggerService();
    childLogger.setContext(this.context);
    // In production with Pino, this would create a child logger with bindings
    return childLogger;
  }

  /**
   * Log with structured data for business events
   */
  event(eventName: string, data: LogContext): void {
    this.log(`Event: ${eventName}`, {
      event: eventName,
      ...data,
    });
  }

  /**
   * Log performance metrics
   */
  metric(name: string, value: number, unit: string = 'ms'): void {
    this.log(`Metric: ${name} = ${value}${unit}`, {
      metric: name,
      value,
      unit,
    });
  }
}
