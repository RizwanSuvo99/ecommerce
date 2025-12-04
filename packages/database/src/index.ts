import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton instance.
 *
 * In development, the module-level PrismaClient is cached on `globalThis`
 * to prevent exhausting database connections during hot-reloading
 * (Next.js / NestJS watch mode re-evaluates modules frequently).
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export * from '@prisma/client';
