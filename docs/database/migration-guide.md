# Database Migration Guide

## Overview

This project uses Prisma Migrate for database schema management. Migrations are stored in `apps/api/prisma/migrations/` and are applied sequentially.

## Common Commands

### Development

```bash
# Create a new migration after schema changes
pnpm --filter api prisma migrate dev --name descriptive_name

# Apply pending migrations
pnpm --filter api prisma migrate dev

# Reset database (WARNING: deletes all data)
pnpm --filter api prisma migrate reset

# Generate Prisma client without migrating
pnpm --filter api prisma generate

# Open Prisma Studio (visual database editor)
pnpm --filter api prisma studio

# Push schema changes without creating migration (prototyping)
pnpm --filter api prisma db push
```

### Production

```bash
# Apply pending migrations in production
pnpm --filter api prisma migrate deploy

# Check migration status
pnpm --filter api prisma migrate status
```

## Migration Workflow

### 1. Modify the Schema

Edit `apps/api/prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  // Add new field
  weight      Decimal? @db.Decimal(10, 2)
}
```

### 2. Create Migration

```bash
pnpm --filter api prisma migrate dev --name add_product_weight
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your development database
3. Regenerate the Prisma client

### 3. Review the Migration

Check the generated SQL in `prisma/migrations/<timestamp>_add_product_weight/migration.sql`:

```sql
ALTER TABLE "Product" ADD COLUMN "weight" DECIMAL(10,2);
```

### 4. Commit and Deploy

```bash
git add prisma/
git commit -m "feat(db): add product weight field"
```

## Best Practices

### Do's

- **Always review generated SQL** before committing
- **Use descriptive migration names** that explain the change
- **Back up the database** before running production migrations
- **Test migrations** on a staging environment first
- **Keep migrations small** and focused on a single change
- **Use `prisma migrate deploy`** in production (not `migrate dev`)

### Don'ts

- **Don't edit migration files** after they've been applied
- **Don't delete migration files** from the migrations directory
- **Don't use `prisma db push`** in production
- **Don't skip migrations** (apply them in order)
- **Don't run `migrate reset`** in production

## Handling Common Scenarios

### Adding a Required Column to Existing Table

If you need to add a required (non-nullable) column to a table with existing data:

```prisma
// Step 1: Add as optional first
model Product {
  newField String?
}

// Step 2: Run data migration to populate existing rows
// Step 3: Make it required
model Product {
  newField String
}
```

### Renaming a Column

Prisma doesn't auto-detect renames. Edit the generated migration:

```sql
-- Instead of DROP + ADD:
ALTER TABLE "Product" RENAME COLUMN "old_name" TO "new_name";
```

### Data Migrations

For complex data migrations, create a custom script:

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Your data migration logic
  const products = await prisma.product.findMany();
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { /* updated fields */ },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Backup Before Migration

Always backup before production migrations:

```bash
# Create backup
./scripts/backup-db.sh --dir ./backups/pre-migration

# Apply migration
pnpm --filter api prisma migrate deploy

# If something goes wrong, restore
./scripts/restore-db.sh ./backups/pre-migration/latest-backup.dump.gz --yes
```

## Troubleshooting

### Migration Failed

```bash
# Check migration status
pnpm --filter api prisma migrate status

# Mark a migration as applied (if manually fixed)
pnpm --filter api prisma migrate resolve --applied <migration_name>

# Mark a migration as rolled back
pnpm --filter api prisma migrate resolve --rolled-back <migration_name>
```

### Schema Drift

If your database schema doesn't match the migrations:

```bash
# Check for drift
pnpm --filter api prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-migrations prisma/migrations

# Create a migration to fix drift
pnpm --filter api prisma migrate dev --name fix_schema_drift
```
