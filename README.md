# 🛒 Bangladesh E-Commerce Platform

A full-stack, production-ready e-commerce platform built for the Bangladeshi market with bilingual support (English/Bangla), local payment integrations, and modern web technologies.

## 🏗 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Internationalization:** next-intl (English/Bangla)

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Cache:** Redis 7
- **Authentication:** JWT + Refresh Tokens
- **File Storage:** Local / S3-compatible

### Infrastructure
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana

## ✨ Features

### Customer Features
- 🔐 Authentication (Email/Password, Social Login)
- 🛍 Product browsing with advanced search and filtering
- 🏷 Categories, brands, and product variants
- 🛒 Shopping cart with persistent storage
- ❤️ Wishlist management
- 📦 Order management with tracking
- 💳 Payment integration (SSLCommerz, bKash, Nagad)
- ⭐ Product reviews and ratings
- 🔖 Coupon and discount system
- 📱 Responsive design (Mobile-first)
- 🌐 Bilingual support (English/বাংলা)

### Admin Features
- 📊 Dashboard with analytics
- 📦 Product management (CRUD, variants, images)
- 📂 Category and brand management
- 🛒 Order management and fulfillment
- 👥 User management
- 🏷 Coupon management
- 📄 CMS pages and menus
- 🎨 Theme customization
- 🖼 Banner management
- 📈 Sales reports
- 🔍 Audit logging

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** >= 24.0.0 (for containerized setup)
- **Docker Compose** >= 2.20.0
- **PostgreSQL** 15+ (if running locally)
- **Redis** 7+ (if running locally)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RizwanSuvo99/ecommerce.git
cd ecommerce
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
# Copy environment files
cp .env.example .env.local
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit the `.env.local` file with your configuration.

### 4. Database Setup

```bash
# Using Docker (recommended)
docker compose up -d postgres redis

# Generate Prisma client
pnpm --filter api prisma generate

# Run migrations
pnpm --filter api prisma migrate dev

# Seed the database
pnpm --filter api prisma db seed
```

### 5. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually
pnpm --filter api dev     # API: http://localhost:4000
pnpm --filter web dev     # Web: http://localhost:3000
```

### Docker Setup (Full Stack)

```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.prod.yml up -d

# With monitoring
docker compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
```

## 📁 Project Structure

```
ecommerce/
├── apps/
│   ├── api/                    # NestJS backend API
│   │   ├── src/
│   │   │   ├── admin/          # Admin module
│   │   │   ├── auth/           # Authentication
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── categories/     # Product categories
│   │   │   ├── common/         # Shared utilities
│   │   │   ├── coupons/        # Discount coupons
│   │   │   ├── email/          # Email service
│   │   │   ├── health/         # Health checks
│   │   │   ├── orders/         # Order management
│   │   │   ├── payment/        # Payment processing
│   │   │   ├── prisma/         # Database ORM
│   │   │   ├── products/       # Product catalog
│   │   │   ├── reviews/        # Product reviews
│   │   │   ├── search/         # Search functionality
│   │   │   ├── settings/       # App settings
│   │   │   ├── upload/         # File uploads
│   │   │   └── users/          # User management
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # Database migrations
│   │   │   └── seed.ts         # Seed data
│   │   └── test/               # API tests
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utility libraries
│   │   │   ├── stores/         # Zustand stores
│   │   │   └── types/          # TypeScript types
│   │   └── public/             # Static assets
│   └── e2e/                    # End-to-end tests
├── packages/
│   ├── config-eslint/          # Shared ESLint config
│   ├── config-typescript/      # Shared TypeScript config
│   ├── shared-types/           # Shared type definitions
│   └── ui/                     # Shared UI components
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   └── database/               # Database documentation
├── nginx/                      # Nginx configuration
├── scripts/                    # Utility scripts
├── docker-compose.yml          # Development Docker setup
├── docker-compose.prod.yml     # Production Docker setup
├── docker-compose.monitoring.yml # Monitoring stack
├── turbo.json                  # Turborepo configuration
└── pnpm-workspace.yaml         # pnpm workspace config
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run end-to-end tests |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm format` | Format code with Prettier |

## 🔧 Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `PORT` | API server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz store ID | - |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz password | - |
| `BKASH_APP_KEY` | bKash app key | - |
| `BKASH_APP_SECRET` | bKash app secret | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |

### Web (`apps/web/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | `http://localhost:3000` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default locale | `en` |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Rizwan** - [@RizwanSuvo99](https://github.com/RizwanSuvo99)

---

Built with ❤️ in Bangladesh 🇧🇩
