import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errorCode: string;
  correlationId: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
}

interface CategorizedError {
  category: ErrorCategory;
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
  shouldReport: boolean;
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) || 'unknown';

    // Categorize the error
    const categorized = this.categorizeError(exception);

    // Build error response
    const errorResponse: ErrorResponse = {
      statusCode: categorized.statusCode,
      message: categorized.message,
      error: categorized.category,
      errorCode: categorized.errorCode,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include validation details in non-production environments
    if (
      categorized.details &&
      (process.env.NODE_ENV !== 'production' ||
        categorized.category === ErrorCategory.VALIDATION)
    ) {
      errorResponse.details = categorized.details;
    }

    // Log the error
    this.logError(exception, categorized, correlationId, request);

    // Report to external error tracking (Sentry placeholder)
    if (categorized.shouldReport) {
      this.reportToErrorTracking(exception, correlationId, request);
    }

    // Send response
    response.status(categorized.statusCode).json(errorResponse);
  }

  private categorizeError(exception: unknown): CategorizedError {
    // HTTP exceptions from NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message as string ||
            exception.message;

      const details =
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as Record<string, unknown>)
          : undefined;

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          return {
            category: ErrorCategory.VALIDATION,
            statusCode: status,
            message: Array.isArray(message) ? message.join(', ') : message,
            errorCode: 'VALIDATION_ERROR',
            details: Array.isArray(message) ? { errors: message } : details,
            shouldReport: false,
          };
        case HttpStatus.UNAUTHORIZED:
          return {
            category: ErrorCategory.AUTHENTICATION,
            statusCode: status,
            message: 'Authentication required',
            errorCode: 'UNAUTHORIZED',
            shouldReport: false,
          };
        case HttpStatus.FORBIDDEN:
          return {
            category: ErrorCategory.AUTHORIZATION,
            statusCode: status,
            message: 'Insufficient permissions',
            errorCode: 'FORBIDDEN',
            shouldReport: false,
          };
        case HttpStatus.NOT_FOUND:
          return {
            category: ErrorCategory.NOT_FOUND,
            statusCode: status,
            message: typeof message === 'string' ? message : 'Resource not found',
            errorCode: 'NOT_FOUND',
            shouldReport: false,
          };
        case HttpStatus.CONFLICT:
          return {
            category: ErrorCategory.CONFLICT,
            statusCode: status,
            message: typeof message === 'string' ? message : 'Resource conflict',
            errorCode: 'CONFLICT',
            shouldReport: false,
          };
        case HttpStatus.TOO_MANY_REQUESTS:
          return {
            category: ErrorCategory.RATE_LIMIT,
            statusCode: status,
            message: 'Too many requests. Please try again later.',
            errorCode: 'RATE_LIMIT_EXCEEDED',
            shouldReport: false,
          };
        case HttpStatus.UNPROCESSABLE_ENTITY:
          return {
            category: ErrorCategory.BUSINESS_LOGIC,
            statusCode: status,
            message: typeof message === 'string' ? message : 'Unprocessable entity',
            errorCode: 'BUSINESS_LOGIC_ERROR',
            details,
            shouldReport: false,
          };
        default:
          return {
            category: status >= 500 ? ErrorCategory.INTERNAL : ErrorCategory.BUSINESS_LOGIC,
            statusCode: status,
            message: typeof message === 'string' ? message : 'An error occurred',
            errorCode: `HTTP_${status}`,
            shouldReport: status >= 500,
          };
      }
    }

    // Prisma/Database errors
    const error = exception as Record<string, unknown>;
    if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
      return this.categorizePrismaError(error);
    }

    // TypeErrors and other programming errors
    if (exception instanceof TypeError) {
      return {
        category: ErrorCategory.INTERNAL,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An internal error occurred',
        errorCode: 'TYPE_ERROR',
        shouldReport: true,
      };
    }

    // Unknown errors
    return {
      category: ErrorCategory.INTERNAL,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      errorCode: 'INTERNAL_ERROR',
      shouldReport: true,
    };
  }

  private categorizePrismaError(error: Record<string, unknown>): CategorizedError {
    switch (error.code) {
      case 'P2002':
        return {
          category: ErrorCategory.CONFLICT,
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with this value already exists',
          errorCode: 'UNIQUE_CONSTRAINT',
          details: { target: (error.meta as Record<string, unknown>)?.target },
          shouldReport: false,
        };
      case 'P2025':
        return {
          category: ErrorCategory.NOT_FOUND,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          errorCode: 'RECORD_NOT_FOUND',
          shouldReport: false,
        };
      case 'P2003':
        return {
          category: ErrorCategory.VALIDATION,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference - related record not found',
          errorCode: 'FOREIGN_KEY_CONSTRAINT',
          shouldReport: false,
        };
      default:
        return {
          category: ErrorCategory.DATABASE,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
          errorCode: `DB_${error.code}`,
          shouldReport: true,
        };
    }
  }

  private logError(
    exception: unknown,
    categorized: CategorizedError,
    correlationId: string,
    request: Request,
  ): void {
    const logData = {
      correlationId,
      category: categorized.category,
      errorCode: categorized.errorCode,
      statusCode: categorized.statusCode,
      method: request.method,
      url: request.url,
      userId: (request as Record<string, unknown>).userId,
    };

    if (categorized.statusCode >= 500) {
      console.error('Unhandled exception:', {
        ...logData,
        error: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else if (categorized.statusCode >= 400) {
      console.warn('Client error:', logData);
    }
  }

  /**
   * Report error to external tracking service (Sentry placeholder)
   * 
   * To enable Sentry:
   * 1. Install: pnpm add @sentry/node
   * 2. Initialize in main.ts: Sentry.init({ dsn: process.env.SENTRY_DSN })
   * 3. Uncomment the Sentry.captureException call below
   */
  private reportToErrorTracking(
    exception: unknown,
    correlationId: string,
    request: Request,
  ): void {
    // Sentry integration placeholder
    // Sentry.withScope((scope) => {
    //   scope.setTag('correlationId', correlationId);
    //   scope.setTag('url', request.url);
    //   scope.setTag('method', request.method);
    //   scope.setUser({ id: (request as any).userId });
    //   scope.setExtra('query', request.query);
    //   scope.setExtra('body', request.body);
    //   Sentry.captureException(exception);
    // });

    // Log that error would be reported
    console.error(`[ErrorTracking] Error would be reported to Sentry`, {
      correlationId,
      error: exception instanceof Error ? exception.message : 'Unknown error',
    });
  }
}
