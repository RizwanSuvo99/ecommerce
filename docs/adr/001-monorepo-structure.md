# ADR 001: Monorepo Structure with Turborepo

## Status

Accepted

## Date

2026-01-01

## Context

We needed to choose a project structure for our e-commerce platform that includes a NestJS API backend, Next.js frontend, shared packages, and end-to-end tests. The main options considered were:

1. **Polyrepo**: Separate repositories for each application
2. **Monorepo with Nx**: Using Nx as the build orchestrator
3. **Monorepo with Turborepo**: Using Turborepo with pnpm workspaces

## Decision

We chose a **Turborepo monorepo** with pnpm workspaces.

### Structure

```
ecommerce/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # Next.js frontend
│   └── e2e/          # Playwright E2E tests
├── packages/
│   ├── config-eslint/
│   ├── config-typescript/
│   ├── shared-types/
│   └── ui/
├── turbo.json
└── pnpm-workspace.yaml
```

## Rationale

### Why Monorepo?

- **Code sharing**: Shared types, UI components, and configurations across apps
- **Atomic changes**: Changes that span multiple packages can be made in a single commit
- **Unified CI/CD**: Single pipeline for all apps
- **Consistent tooling**: Same linting, formatting, and testing setup everywhere

### Why Turborepo over Nx?

- **Simpler configuration**: Less boilerplate and configuration needed
- **pnpm native**: Works seamlessly with pnpm workspaces
- **Faster setup**: Lower learning curve for the team
- **Remote caching**: Built-in remote cache support via Vercel
- **Incremental builds**: Smart caching based on file changes

### Why pnpm?

- **Disk efficiency**: Uses content-addressable storage (symlinks)
- **Strict dependency resolution**: Prevents phantom dependencies
- **Workspace support**: Native monorepo support
- **Speed**: Faster than npm and yarn for installations

## Consequences

### Positive

- Shared code reduces duplication and inconsistencies
- Changes across packages are easier to coordinate
- Single source of truth for dependencies
- Turborepo cache significantly speeds up CI/CD

### Negative

- Larger repository size over time
- Requires understanding of workspace concepts
- Some tools may need configuration for monorepo support
- Initial setup is more complex than a single app
