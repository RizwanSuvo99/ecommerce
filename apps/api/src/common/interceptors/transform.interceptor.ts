import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        // If already formatted (e.g., paginated responses), extract meta
        if (responseData && typeof responseData === 'object' && 'data' in responseData && 'meta' in responseData) {
          return {
            success: true,
            data: responseData.data,
            meta: responseData.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.stripNulls(data)),
    );
  }

  private stripNulls(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.stripNulls(item));
    }

    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, v]) => v !== null)
          .map(([k, v]) => [k, this.stripNulls(v)]),
      );
    }

    return value;
  }
}

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - start;
        response.setHeader('X-Response-Time', `${duration}ms`);
        return data;
      }),
    );
  }
}
