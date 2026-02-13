import { SetMetadata } from '@nestjs/common';

const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Set cache TTL in seconds for GET endpoints
 * @param ttlSeconds - Time to live in seconds
 *
 * @example
 * @CacheTTL(300)  // 5 minutes
 * @Get('products')
 * async getProducts() { ... }
 */
export const CacheTTL = (ttlSeconds: number) => SetMetadata(CACHE_TTL_KEY, ttlSeconds);

/**
 * Common cache duration presets
 */
export const CachePresets = {
  /** 30 seconds - for rapidly changing data */
  SHORT: 30,
  /** 5 minutes - default for most endpoints */
  MEDIUM: 300,
  /** 30 minutes - for semi-static data */
  LONG: 1800,
  /** 1 hour - for rarely changing data */
  HOUR: 3600,
  /** 24 hours - for static data */
  DAY: 86400,
} as const;

/**
 * No-cache decorator to explicitly skip caching
 */
export const NoCache = () => SetMetadata(CACHE_TTL_KEY, 0);
