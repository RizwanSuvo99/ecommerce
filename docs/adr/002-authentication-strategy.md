# ADR 002: Authentication Strategy with JWT + Refresh Tokens

## Status

Accepted

## Date

2026-01-05

## Context

We needed to implement authentication for the e-commerce platform. The system needs to support:

- Email/password authentication
- Session management across browser tabs
- Secure token storage
- Admin and customer role separation
- Future social login support

Options considered:

1. **Session-based auth**: Server-side sessions with cookies
2. **JWT only**: Stateless JWT tokens
3. **JWT + Refresh tokens**: Short-lived access + long-lived refresh tokens
4. **OAuth2/OpenID Connect**: External identity provider

## Decision

We chose **JWT + Refresh Tokens** with HTTP-only cookies.

### Implementation Details

- **Access Token**: Short-lived (15 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only secure cookie
- **Token rotation**: New refresh token issued on each refresh
- **Blacklisting**: Revoked tokens tracked in Redis
- **Password hashing**: bcrypt with 12 salt rounds

### Flow

```
1. Login → Access Token (memory) + Refresh Token (HTTP-only cookie)
2. API requests → Authorization: Bearer <access_token>
3. Token expired → POST /auth/refresh (uses cookie) → New tokens
4. Logout → Blacklist refresh token in Redis, clear cookie
```

## Rationale

### Why not session-based?

- Doesn't scale well horizontally (sticky sessions or shared store)
- More server memory usage
- JWT is better for API-first architecture

### Why not JWT only?

- Long-lived JWTs are a security risk if leaked
- No way to revoke tokens without additional infrastructure
- Short-lived tokens alone cause poor UX (frequent re-authentication)

### Why refresh tokens?

- Short access token lifetime limits exposure window
- Refresh tokens enable silent token renewal
- Token rotation detects token theft
- HTTP-only cookies prevent XSS attacks on refresh tokens

## Consequences

### Positive

- Stateless authentication scales horizontally
- Short access tokens limit security exposure
- HTTP-only cookies protect against XSS
- Token rotation provides theft detection
- Works well with microservices architecture

### Negative

- More complex than simple session management
- Requires Redis for token blacklisting
- Token refresh adds latency every 15 minutes
- Need to handle concurrent refresh requests carefully
