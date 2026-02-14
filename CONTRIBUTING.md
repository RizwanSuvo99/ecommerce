# Contributing to Bangladesh E-Commerce Platform

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be kind and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker >= 24.0.0 (recommended)
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/ecommerce.git
   cd ecommerce
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/RizwanSuvo99/ecommerce.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   docker compose up -d postgres redis
   pnpm --filter api prisma migrate dev
   pnpm --filter api prisma db seed
   ```

6. **Start development**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Create a new branch for each feature or fix:

```bash
git checkout -b <type>/<description>
```

Types:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/product-reviews`
- `fix/cart-calculation-error`
- `docs/api-swagger-update`

### Making Changes

1. Keep your fork up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Make your changes in small, focused commits

3. Write or update tests for your changes

4. Ensure all tests pass:
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types; use `unknown` when type is uncertain
- Define interfaces for all data structures
- Use enums for fixed sets of values

### NestJS (Backend)

- Follow NestJS module architecture
- Use DTOs with class-validator decorators for input validation
- Implement proper error handling with HTTP exceptions
- Add Swagger decorators for all endpoints
- Write unit tests for services and e2e tests for controllers

### Next.js (Frontend)

- Use Server Components by default; add `'use client'` only when needed
- Follow the App Router patterns and conventions
- Use Tailwind CSS for styling (no inline styles or CSS modules)
- Implement bilingual support (English + Bangla) for all user-facing text
- Use Zustand for client-side state management
- Implement proper loading and error states

### General

- Follow the existing code style (enforced by ESLint and Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs and complex logic
- Keep functions small and focused (single responsibility)
- DRY (Don't Repeat Yourself) - extract shared logic into utilities

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Maintenance, dependencies, configs |
| `ci` | CI/CD changes |

### Scopes

- `api` - Backend API changes
- `web` - Frontend changes
- `db` - Database changes
- `docker` - Docker configuration
- `root` - Root-level changes

### Examples

```
feat(api): add product review moderation endpoint
fix(web): correct cart total calculation with coupons
docs(api): update Swagger docs for payment endpoints
test(api): add unit tests for order service
chore(docker): update Node.js base image to 18.19
```

## Pull Requests

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Code follows project standards
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Template

When creating a PR, include:

1. **Summary**: Brief description of changes
2. **Motivation**: Why is this change needed?
3. **Changes**: List of specific changes made
4. **Testing**: How were the changes tested?
5. **Screenshots**: For UI changes, include before/after screenshots

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, the PR will be merged
4. Your branch will be deleted after merge

## Reporting Bugs

### Before Reporting

- Check existing [issues](https://github.com/RizwanSuvo99/ecommerce/issues)
- Ensure the bug is reproducible

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 18.19.0]
- Browser: [e.g., Chrome 120]

**Screenshots**
If applicable, add screenshots.
```

## Suggesting Features

Open an issue with the `feature-request` label:

```markdown
**Problem**
What problem does this feature solve?

**Proposed Solution**
How would you implement this?

**Alternatives Considered**
Other approaches you've thought about.

**Additional Context**
Any other information.
```

## Questions?

Feel free to open a [Discussion](https://github.com/RizwanSuvo99/ecommerce/discussions) for questions or ideas.

---

Thank you for contributing! Your efforts help make this project better for everyone. 🙏
