# ADR 003: Payment Integration Strategy

## Status

Accepted

## Date

2026-01-10

## Context

The platform targets the Bangladeshi market and needs to support local payment methods. The payment landscape in Bangladesh includes:

- **SSLCommerz**: Most widely used payment gateway (Visa, Mastercard, bKash, Nagad, etc.)
- **bKash**: Most popular mobile financial service (~65M users)
- **Nagad**: Second largest MFS (~85M accounts)
- **Cash on Delivery**: Still dominant for e-commerce

Options considered:

1. **SSLCommerz only**: Single gateway for all payment methods
2. **Direct integrations**: Individual integration with each provider
3. **Hybrid approach**: SSLCommerz for cards + direct MFS integrations
4. **International gateway**: Stripe/PayPal (limited Bangladesh support)

## Decision

We chose a **hybrid approach**:

1. **SSLCommerz** for card payments (Visa, Mastercard, AMEX)
2. **Direct bKash** integration via bKash Checkout API
3. **Direct Nagad** integration via Nagad Payment Gateway
4. **Cash on Delivery** as built-in option

### Architecture

```
PaymentService (Strategy Pattern)
├── SSLCommerzProvider  → Card payments
├── BkashProvider       → bKash mobile payments
├── NagadProvider       → Nagad mobile payments
└── CODProvider         → Cash on Delivery
```

## Rationale

### Why not SSLCommerz only?

- Direct bKash/Nagad integrations provide better UX (native checkout)
- Lower transaction fees for direct MFS integrations
- SSLCommerz adds redirect overhead for MFS payments
- Direct integration gives more control over the payment flow

### Why keep SSLCommerz?

- Handles card payment PCI compliance
- Supports international cards
- Reliable fallback for other payment methods
- Well-established in Bangladesh market

### Strategy Pattern

- Easy to add new payment providers
- Each provider encapsulated with its own logic
- Common interface for order processing
- Provider selection based on user choice

## Consequences

### Positive

- Native MFS experience improves conversion rates
- Lower fees with direct integrations
- Flexibility to add new providers easily
- COD support critical for Bangladeshi market

### Negative

- Multiple integrations to maintain
- Each provider has different API patterns
- Need to handle webhook callbacks from multiple sources
- Testing requires sandbox accounts for each provider
