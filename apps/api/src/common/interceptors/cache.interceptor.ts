import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

const CACHE_TTL_KEY = 'cache_ttl';
const CACHE_KEY_PREFIX = 'api_cache:';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check for cache TTL decorator
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());
    if (!ttl) {
      return next.handle();
    }

    // Generate cache key from URL and query params
    const cacheKey = this.generateCacheKey(request);

    // Check if user-specific (don't cache authenticated responses for shared cache)
    const isAuthenticated = !!request.headers.authorization;
    if (isAuthenticated) {
      return next.handle();
    }

    try {
      const cachedResponse = await this.cacheManager.get(cacheKey);
      if (cachedResponse) {
        this.logger.debug(`Cache HIT: ${cacheKey}`);
        return of(cachedResponse);
      }
    } catch (error) {
      this.logger.warn(`Cache read error: ${error.message}`);
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.cacheManager.set(cacheKey, response, ttl * 1000);
          this.logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
        } catch (error) {
          this.logger.warn(`Cache write error: ${error.message}`);
        }
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const url = request.originalUrl || request.url;
    const locale = request.headers['accept-language']?.includes('bn') ? 'bn' : 'en';
    return `${CACHE_KEY_PREFIX}${locale}:${url}`;
  }
}

// Cache invalidation utility
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const store = this.cacheManager.store as any;
      if (store.keys) {
        const keys: string[] = await store.keys(`${CACHE_KEY_PREFIX}*${pattern}*`);
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        this.logger.log(`Invalidated ${keys.length} cache entries matching: ${pattern}`);
      }
    } catch (error) {
      this.logger.warn(`Cache invalidation error: ${error.message}`);
    }
  }

  async invalidateProduct(slug: string): Promise<void> {
    await this.invalidatePattern(`/products/${slug}`);
    await this.invalidatePattern('/products?');
  }

  async invalidateCategory(slug: string): Promise<void> {
    await this.invalidatePattern(`/categories/${slug}`);
    await this.invalidatePattern('/categories');
  }

  async clearAll(): Promise<void> {
    await this.cacheManager.reset();
    this.logger.log('All cache cleared');
  }
}
