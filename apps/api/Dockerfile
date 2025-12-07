# ═══════════════════════════════════════════════════════════
# E-Commerce API — Multi-stage Docker Build
# ═══════════════════════════════════════════════════════════
# Build:   docker build -t ecommerce-api -f apps/api/Dockerfile .
# Run:     docker run -p 3001:3001 --env-file .env ecommerce-api
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# Stage 1: Install dependencies
# ───────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/config/typescript/package.json ./packages/config/typescript/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

# Install only the dependencies needed for the API
RUN pnpm install --frozen-lockfile --filter @ecommerce/api...

# ───────────────────────────────────────────────────────────
# Stage 2: Build the application
# ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/ ./

# Copy source code for all packages the API depends on
COPY packages/config/typescript/ ./packages/config/typescript/
COPY packages/config/eslint/ ./packages/config/eslint/
COPY packages/types/ ./packages/types/
COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

# Build the API and its dependencies
RUN pnpm build --filter @ecommerce/api

# ───────────────────────────────────────────────────────────
# Stage 3: Production runner
# ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only the built output and production dependencies
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
