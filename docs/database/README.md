# Database Schema Documentation

## Overview

The e-commerce platform uses PostgreSQL 15 as the primary database, managed through Prisma ORM. The schema supports a full-featured e-commerce system with bilingual content (English/Bangla).

## Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│    User      │────<│    Order      │────<│   OrderItem     │
│             │     │              │     │                 │
│ id          │     │ id           │     │ id              │
│ email       │     │ userId       │     │ orderId         │
│ name        │     │ status       │     │ productId       │
│ nameBn      │     │ total        │     │ variantId       │
│ password    │     │ shippingAddr │     │ quantity        │
│ phone       │     │ paymentMethod│     │ price           │
│ role        │     │ paymentStatus│     │ total           │
│ avatar      │     │ trackingNo   │     └─────────────────┘
│ isActive    │     │ notes        │            │
│ isVerified  │     │ createdAt    │            │
│ createdAt   │     └──────────────┘            │
│ updatedAt   │            │                    │
└─────────────┘            │              ┌─────┴───────────┐
      │                    │              │   Product        │
      │              ┌─────┴──────┐      │                 │
      │              │  Payment   │      │ id              │
      │              │            │      │ name            │
      │              │ id         │      │ nameBn          │
      │              │ orderId    │      │ slug            │
      │              │ provider   │      │ description     │
      │              │ transId    │      │ descriptionBn   │
      │              │ amount     │      │ price           │
      │              │ status     │      │ comparePrice    │
      │              │ metadata   │      │ sku             │
      │              └────────────┘      │ stock           │
      │                                  │ categoryId      │
      │     ┌────────────┐              │ brandId         │
      ├────<│  Review    │──────────────>│ images          │
      │     │            │              │ isActive        │
      │     │ id         │              │ isFeatured      │
      │     │ userId     │              │ createdAt       │
      │     │ productId  │              └─────────────────┘
      │     │ rating     │                     │
      │     │ comment    │              ┌──────┴──────────┐
      │     │ createdAt  │              │ ProductVariant  │
      │     └────────────┘              │                 │
      │                                 │ id              │
      │     ┌────────────┐             │ productId       │
      ├────<│  Wishlist  │             │ name            │
      │     │            │             │ sku             │
      │     │ id         │             │ price           │
      │     │ userId     │             │ stock           │
      │     │ productId  │             │ attributes      │
      │     └────────────┘             └─────────────────┘
      │                                       │
      │     ┌────────────┐             ┌──────┴──────────┐
      └────<│   Cart     │             │   Category      │
            │            │             │                 │
            │ id         │             │ id              │
            │ userId     │             │ name            │
            │ items[]    │             │ nameBn          │
            │ createdAt  │             │ slug            │
            └────────────┘             │ description     │
                                       │ parentId        │
                                       │ image           │
          ┌────────────┐              │ isActive        │
          │   Brand    │              └─────────────────┘
          │            │
          │ id         │       ┌─────────────┐
          │ name       │       │   Coupon     │
          │ nameBn     │       │             │
          │ slug       │       │ id          │
          │ logo       │       │ code        │
          │ isActive   │       │ type        │
          └────────────┘       │ value       │
                               │ minPurchase │
          ┌────────────┐      │ maxDiscount │
          │   Banner   │      │ usageLimit  │
          │            │      │ usedCount   │
          │ id         │      │ startDate   │
          │ title      │      │ endDate     │
          │ titleBn    │      │ isActive    │
          │ image      │      └─────────────┘
          │ link       │
          │ position   │      ┌─────────────┐
          │ isActive   │      │   Page       │
          │ sortOrder  │      │             │
          └────────────┘      │ id          │
                               │ title       │
          ┌────────────┐      │ titleBn     │
          │   Menu     │      │ slug        │
          │            │      │ content     │
          │ id         │      │ contentBn   │
          │ name       │      │ isPublished │
          │ location   │      └─────────────┘
          │ items[]    │
          └────────────┘      ┌─────────────┐
                               │  Setting    │
          ┌────────────┐      │             │
          │ AuditLog   │      │ id          │
          │            │      │ key         │
          │ id         │      │ value       │
          │ userId     │      │ group       │
          │ action     │      └─────────────┘
          │ entity     │
          │ entityId   │
          │ changes    │
          │ ipAddress  │
          │ createdAt  │
          └────────────┘
```

## Model Documentation

### User
The central user entity supporting both customers and administrators.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email address |
| name | String | Full name (English) |
| nameBn | String? | Full name (Bangla) |
| password | String | Bcrypt hashed password |
| phone | String? | Phone number |
| role | Enum | USER, ADMIN, SUPER_ADMIN |
| avatar | String? | Profile image URL |
| isActive | Boolean | Account status |
| isVerified | Boolean | Email verification status |
| addresses | Json[] | Shipping/billing addresses |

### Product
Products with bilingual content and variant support.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Product name (English) |
| nameBn | String? | Product name (Bangla) |
| slug | String | URL-friendly unique slug |
| description | Text | Full description (English) |
| descriptionBn | Text? | Full description (Bangla) |
| price | Decimal | Base price in BDT |
| comparePrice | Decimal? | Compare-at price (for sales) |
| sku | String | Stock Keeping Unit |
| stock | Int | Available quantity |
| categoryId | UUID | Foreign key to Category |
| brandId | UUID? | Foreign key to Brand |
| images | String[] | Array of image URLs |
| tags | String[] | Product tags |
| attributes | Json | Product attributes |
| weight | Decimal? | Weight in grams |
| isActive | Boolean | Published status |
| isFeatured | Boolean | Featured on homepage |

### Order
Order management with full lifecycle tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| orderNumber | String | Human-readable order number |
| userId | UUID | Foreign key to User |
| status | Enum | PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED |
| subtotal | Decimal | Items total before discount |
| discount | Decimal | Discount amount |
| shippingCost | Decimal | Shipping charges |
| total | Decimal | Final total in BDT |
| shippingAddress | Json | Delivery address |
| billingAddress | Json | Billing address |
| paymentMethod | Enum | COD, SSLCOMMERZ, BKASH, NAGAD |
| paymentStatus | Enum | PENDING, PAID, FAILED, REFUNDED |
| trackingNumber | String? | Shipping tracking number |
| notes | String? | Order notes |
| couponId | UUID? | Applied coupon |

### Payment
Payment transaction records.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| orderId | UUID | Foreign key to Order |
| provider | Enum | Payment provider |
| transactionId | String | Provider transaction ID |
| amount | Decimal | Payment amount in BDT |
| currency | String | Currency code (BDT) |
| status | Enum | INITIATED, SUCCESS, FAILED, REFUNDED |
| metadata | Json | Provider-specific data |
| paidAt | DateTime? | Payment completion time |

## Indexes

The following indexes are defined for optimal query performance:

- `User`: email (unique), phone
- `Product`: slug (unique), sku (unique), categoryId, brandId, (isActive, isFeatured)
- `Order`: userId, orderNumber (unique), status, createdAt
- `Category`: slug (unique), parentId
- `Review`: userId + productId (unique), productId
- `AuditLog`: userId, entity + entityId, createdAt

## Migrations

See [Migration Guide](./migration-guide.md) for instructions on creating and running migrations.
