---
name: run-ecommerce-dev
description:
  Step-by-step guide to bring this Bangladesh E-Commerce monorepo (NestJS API +
  Next.js 14 web + Postgres + Redis) up in a local dev environment, including
  the non-obvious fixes that are otherwise easy to hit. Use this skill whenever
  the user asks to "run the app", "start dev", "spin up the project", "set up
  locally", "get it running", "fix run issues", mentions the API not starting,
  /login 500, Firebase auth/invalid-api-key, Google OAuth context errors,
  puppeteer install failures, or wonders why `/api/health` returns 404 — even if
  they don't name this skill explicitly.
---

# Run the E-Commerce App in Dev

This skill captures the working sequence for starting the `apps/api` (NestJS) +
`apps/web` (Next.js 14) monorepo locally, plus the fixes for issues that bite on
a fresh clone.

## Stack at a glance

- **API**: NestJS 10, Prisma 5, Postgres 16, Redis 7. Runs on
  **`http://localhost:3001/api`**, with **URI versioning enabled** — so real
  routes live under `/api/v1/...` (e.g. `/api/v1/health`, `/api/v1/products`).
- **Web**: Next.js 14 (App Router). Runs on **`http://localhost:3000`**.
- **Infra**: `docker-compose.yml` at the repo root brings up Postgres + Redis (+
  pgAdmin).
- **Monorepo**: pnpm workspaces orchestrated by Turborepo. `pnpm dev` at the
  root runs both apps.

## Prerequisites

- Node.js ≥ 20 (the repo's `engines.node`)
- pnpm ≥ 9
- Docker + Docker Compose

## Startup sequence

Do these in order. Each step explains _why_ — skipping the puppeteer env var and
the versioning note are the two traps.

### 1. Environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

The example values are enough to boot. Stripe/Firebase/Google OAuth keys are
placeholders — the app boots without them; only those specific features are
inert.

### 2. Install dependencies (skip the puppeteer Chromium download)

```bash
PUPPETEER_SKIP_DOWNLOAD=true pnpm install
```

**Why the env var:** `apps/api` depends on `puppeteer` for Bangla invoice PDFs.
Its postinstall tries to download Chromium and regularly fails on unreliable
networks with `end of central directory record signature not found`. That single
failure makes pnpm exit non-zero and **skips linking binaries** (prisma, nest) —
which then breaks every subsequent step with `Command "prisma" not found`.
Setting `PUPPETEER_SKIP_DOWNLOAD=true` makes install complete. PDFs won't render
until you install a headless Chrome, but nothing else is affected.

If you've already installed without the flag and hit the prisma error, re-run
with the flag — it will finish linking.

### 3. Start Postgres + Redis

```bash
docker compose up -d postgres redis
```

This starts the `ecommerce-postgres` (port 5432) and `ecommerce-redis`
(port 6379) containers. The default `apps/api/.env` DATABASE_URL already points
at these. `docker compose ps` should show both as `healthy` within ~15s.

### 4. Generate Prisma client and push the schema

```bash
cd apps/api
pnpm exec prisma generate
pnpm exec prisma db push
```

`prisma db push` is what you want for a fresh dev DB — it syncs the schema
without needing a migration history (the repo has no `prisma/migrations/`
folder). There's no seed script; the DB starts empty.

### 5. Run both dev servers

From the repo root:

```bash
pnpm dev
```

Turbo launches `apps/api` (nest --watch) and `apps/web` (next dev) together.
Healthy output includes:

- `[Bootstrap] Application is running on: http://localhost:3001/api`
- `▲ Next.js 14.2.21 - Local: http://localhost:3000 ✓ Ready in ...`

### 6. Smoke test

Use the **versioned** paths for the API:

```bash
curl -s http://localhost:3001/api/v1/health
# {"status":"ok", "checks":{"database":{"status":"up"},"redis":{"status":"up"},...}}
```

For the web, `curl -I http://localhost:3000/` returns 200. Typical sanity
routes: `/products`, `/cart`, `/login`, `/register`, `/admin`,
`/admin/products`.

## Common runtime issues and fixes

These are the ones that reliably appear on a fresh setup.

### `/api/health` returns 404 — but the log showed it was mapped

Nest has URI versioning enabled, so the mounted path is `/api/v1/health`, not
`/api/health`. Same for every other route under `/api` — always prefix with
`v1`.

### `Command "prisma" not found` from pnpm

pnpm's install exited non-zero (usually because of puppeteer's chrome download).
Binaries in `node_modules/.bin` never got linked. Re-run install with
`PUPPETEER_SKIP_DOWNLOAD=true pnpm install`.

### `/login` returns 500 with `FirebaseError: auth/invalid-api-key`

`apps/web/src/lib/firebase.ts` used to call `initializeApp(firebaseConfig)` at
module load. When Firebase env vars aren't set (which is the default), this
throws during SSR of `/login` because it imports `phone-login-dialog.tsx` which
imports `firebaseAuth`.

The fix already in this repo uses a lazy Proxy — initialization only happens on
first method call. If you see this error again, check that
`apps/web/src/lib/firebase.ts` still exports `firebaseAuth` as a Proxy rather
than calling `getAuth(app)` eagerly.

### `Google OAuth components must be used within GoogleOAuthProvider`

`apps/web/src/components/auth/google-auth-wrapper.tsx` used to short-circuit and
render `children` without the provider when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was
missing. That broke `useGoogleLogin` downstream in `social-login-buttons.tsx`,
which unconditionally calls the hook.

The fix in this repo always renders `GoogleOAuthProvider` (with a placeholder
`clientId` string if the env var is missing). The button will fail gracefully on
click without real creds, but the page renders. If you reintroduce a conditional
provider, pages with `<SocialLoginButtons />` will 500 again.

### `@nestjs/swagger` unmet-peer warnings for `@nestjs/common@^11`

The repo pins `@nestjs/common@^10` but `@nestjs/swagger@^11` wants NestJS 11.
These are warnings only and the API boots fine — safe to ignore unless you're
upgrading Nest.

### `Stripe not configured - payment features disabled`

Expected warning — `STRIPE_SECRET_KEY` in `.env.example` is `sk_test_...`. Add
real test keys if you need the Stripe flow; otherwise ignore.

### PWA icon 404s in the browser / Next logs (`/icons/icon-144x144.png`)

`apps/web/public/manifest.json` references PWA icons that aren't in
`public/icons/`. Cosmetic — doesn't break the app.

## Useful one-liners

```bash
# Stop the dev stack
pnpm dev           # Ctrl-C to stop the turbo run
docker compose down

# Reset the database (nukes data)
cd apps/api && pnpm exec prisma db push --force-reset

# Tail just the API or web logs when both are running under turbo
pnpm --filter api dev
pnpm --filter web dev

# Inspect all mapped API routes
curl -s http://localhost:3001/api/v1/health
# For the full list, read NestJS startup log lines containing "Mapped"
```

## Where configuration lives

- `docker-compose.yml` — Postgres/Redis/pgAdmin; env defaults via
  `${POSTGRES_USER:-ecommerce}` etc.
- `apps/api/.env` — DB URL, Redis URL, JWT secrets, Stripe, S3, SMTP,
  `PORT=3001`, `CORS_ORIGIN=http://localhost:3000`.
- `apps/web/.env` — `NEXT_PUBLIC_API_URL=http://localhost:3001`,
  `NEXT_PUBLIC_APP_URL=http://localhost:3000`, Stripe publishable, optional
  Firebase/Google/Facebook keys.
- `turbo.json` — task graph; `dev` is `persistent: true` so it streams until
  Ctrl-C.

## When something else breaks

1. Check which app is broken: the turbo log prefixes every line with
   `@ecommerce/api:dev:` or `@ecommerce/web:dev:`.
2. Grep the log for `⨯`, `ERROR`, or `Exception` — Next prints `⨯` before SSR
   error traces.
3. If only the API is dead, `docker compose ps` first — an unhealthy
   Postgres/Redis will surface as Prisma connection errors.
4. `pnpm exec prisma studio` from `apps/api` gives a quick DB inspector on
   port 5555.
