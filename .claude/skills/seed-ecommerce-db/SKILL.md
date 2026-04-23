---
name: seed-ecommerce-db
description:
  Instantly seed (or reseed) this Bangladesh E-Commerce monorepo's Postgres
  database with admin, categories, brands, products, images, variants,
  inventory, reviews, orders, CMS pages, banners and settings — and audit
  coverage so every public route (`/`, `/shop`, `/categories`,
  `/categories/[slug]`, `/deals`, `/search`, `/collections/[slug]`,
  `/products/[slug]`) actually renders products. Use this skill whenever the
  user asks to "seed the db", "seed data", "reseed", "populate products", "reset
  the database", "fill in test data", mentions running `pnpm seed` / `pnpm
  db:seed` / `prisma db seed`, or reports that a category / shop / deals / home
  page is empty, shows "No products", "This collection is coming soon", "No
  deals available", a 0-count category in `/categories`, or any "page has
  nothing on it" complaint — even if they don't say the word "seed" explicitly.
  Also use when the user wants to extend the seed with more products, fill
  specific categories, or verify which categories/routes are under-populated.
---

# Seed the E-Commerce DB

This skill covers the idempotent seed for the `ecommerce` monorepo and the
coverage audit that keeps every public route non-empty. The seed upserts by
`slug`/`sku`, so re-running is always safe — treat it as the go-to fix for "page
is empty" and "I just pulled / ran `prisma migrate reset`, rehydrate the data".

## Happy path — just seed it

From the repo root:

```bash
cd packages/database && pnpm seed
```

Equivalent: `pnpm db:seed` from root (runs via Turbo). The seed entrypoint is
`packages/database/prisma/seed.ts` and runs with `tsx`. Expect output similar
to:

```
Seeded 36 categories
Seeded 24 brands
Seeded 85 products with images, variants & inventory
Seeded 5 CMS pages / 5 banners / 3 shipping methods / 46 settings / …
Seeded 6 customers, 6 addresses, 22 orders
Seeded 15 reviews
Seed completed successfully.
```

The admin account seeded is `admin@shopbd.com` / `Admin@ShopBD2025!`
(SUPER_ADMIN). A demo customer is also created.

### Prereqs worth checking when the seed fails

- `DATABASE_URL` must be set for `packages/database` (usually via root `.env`).
- Prisma client must be generated: `pnpm --filter @ecommerce/database generate`.
- Schema must be in sync: `pnpm --filter @ecommerce/database push` (dev) or
  `migrate deploy` (if migrations are the source of truth). If `prisma` errors
  with "table does not exist", run `push` first and then reseed.
- `bcrypt` is dynamically required for the admin password. It's hoisted in the
  workspace; if the require fails the script falls back to a non-bcrypt hash and
  the admin login will break, so prefer fixing `bcrypt` over running with the
  fallback.

## What seeds and where it's defined

Everything lives in a single file: `packages/database/prisma/seed.ts`. The
interesting constants (grep these to find sections quickly):

| Section            | Constant / function      | What it produces                                  |
| ------------------ | ------------------------ | ------------------------------------------------- |
| Admin user         | `seedAdminUser`          | 1 SUPER_ADMIN                                     |
| Categories         | `CATEGORIES`             | 10 parents + 26 children (36 total)               |
| Brands             | `BRANDS`                 | 24 brands                                         |
| Products           | `PRODUCTS`               | ~85 products with images, variants, inventory     |
| CMS pages          | `seedPages`              | About, Contact, Terms, Privacy, Shipping          |
| Banners            | `seedBanners`            | Hero + promo banners                              |
| Navigation         | `seedMenus`              | Header, footer, mobile menus                      |
| Shipping methods   | `seedShippingMethods`    | COD, bKash, etc.                                  |
| Settings           | `seedSettings`           | Site-level settings                               |
| Email templates    | `seedEmailTemplates`     | Order/account emails                              |
| Customers + orders | `seedCustomersAndOrders` | Demo customers, addresses, 22 orders all statuses |
| Reviews            | `seedReviews`            | Pending / approved / rejected                     |

All upserts are keyed on `slug` (categories, products, pages, banners) or `sku`
(variants) or `email` (users). Re-seeding never duplicates; it refreshes fields
from the constants — so editing a product in the seed file and re-running is how
you update it.

## Route → data requirement map

Use this to decide which dimension of the seed needs to be extended when a
specific page is empty.

| Route                 | Needs                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/` (home) — Featured | Products with `isFeatured: true`                                                                                         |
| `/` — New Arrivals    | Any ACTIVE products (sorted by `createdAt` desc)                                                                         |
| `/shop`, `/products`  | Any ACTIVE products                                                                                                      |
| `/categories`         | Hierarchical categories with product counts (parents aggregate children)                                                 |
| `/categories/[slug]`  | At least ~3 ACTIVE products on that leaf; parents auto-include children                                                  |
| `/deals`              | Products with `compareAtPrice > price`                                                                                   |
| `/search`             | Anything indexable by name/description                                                                                   |
| `/collections/[slug]` | API ignores unknown `collection=` param → returns general listing. No special data needed, but better if products exist. |
| `/products/[slug]`    | Product row, its images, variants, inventory                                                                             |
| `/admin/*`            | Admin user + at least some orders/customers to be interesting                                                            |

Parent categories (`fashion`, `home-living`, `beauty-health`, `groceries`,
`baby-kids`, `electronics`) deliberately have zero direct products — the NestJS
service at `apps/api/src/products/products.service.ts` (look for the
`categorySlug`/`categoryId` branch that fetches `children: true`) expands a
parent filter to include all children's `categoryId`s. So coverage work targets
**leaf** categories only.

## Coverage audit — which routes are under-populated?

The single most useful audit query. Run from anywhere in the repo:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.\$queryRaw\`
    SELECT c.slug, COUNT(pr.id)::int AS count
    FROM categories c
    LEFT JOIN products pr ON pr.\"categoryId\" = c.id AND pr.status = 'ACTIVE'
    GROUP BY c.slug ORDER BY count ASC, c.slug\`;
  for (const r of rows) console.log(r.count.toString().padStart(3), r.slug);
  await p.\$disconnect();
})();"
```

Interpretation:

- Any **leaf** category with `< ~3` direct products = a thin
  `/categories/[slug]` page. Extend `PRODUCTS` for that `categorySlug`.
- Any **parent** category with `0` direct products is expected — check that its
  children have products, since the API expands parents:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const parents = await p.category.findMany({ where: { parentId: null }, include: { children: true } });
  for (const parent of parents) {
    const ids = [parent.id, ...parent.children.map(c => c.id)];
    const n = await p.product.count({ where: { status: 'ACTIVE', categoryId: { in: ids } } });
    console.log(n.toString().padStart(3), parent.slug, '(', parent.children.length, 'children)');
  }
  await p.\$disconnect();
})();"
```

Global sanity check (home + deals + featured + reviews):

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.product.count({ where: { status: 'ACTIVE' } });
  const featured = await p.product.count({ where: { status: 'ACTIVE', isFeatured: true } });
  const deals = await p.\$queryRaw\`SELECT COUNT(*)::int AS n FROM products WHERE status='ACTIVE' AND \"compareAtPrice\" IS NOT NULL AND \"compareAtPrice\" > price\`;
  console.log('ACTIVE products:', total, 'Featured:', featured, 'Deals:', deals[0].n);
  await p.\$disconnect();
})();"
```

A healthy baseline: ~80 ACTIVE products, ~30 featured, most products on
discount, every leaf ≥ 3 products.

## Extending the seed — adding products

All product data sits in the `PRODUCTS` array in `seed.ts`. To fill a leaf
category, append entries before the closing `];` of that array. The shape:

```ts
{
  name: 'Brand Model Variant',
  nameBn: 'বাংলা নাম',             // optional
  slug: 'brand-model-variant',       // unique, used as upsert key
  description: 'Long description...',
  descriptionBn: '...',              // optional
  shortDescription: '1-liner',       // optional
  sku: 'BRND-MDL-001',               // unique
  price: 12999,                      // numbers OK; Prisma Decimal accepts them
  compareAtPrice: 14999,             // set this to appear in /deals
  costPrice: 9000,                   // optional
  quantity: 100,
  categorySlug: 'leaf-slug-here',    // MUST match an existing Category.slug
  brandSlug: 'brand-slug',           // optional; looked up in brandMap
  tags: ['tag1', 'tag2'],
  isFeatured: true,                  // surfaces on / homepage
  weight: 0.3,
  images: [                          // first becomes the primary image
    'https://images.unsplash.com/photo-XXXX?w=800&h=800&fit=crop&q=80',
  ],
  variants: [                        // optional; sku must be unique
    { name: 'Size/Color', sku: 'BRND-MDL-001-VAR', price: 12999, quantity: 40 },
  ],
}
```

Notes the seed code already handles for you (don't duplicate):

- A `thumbnailUrl` is auto-derived from the image URL (`w=800&h=800` →
  `w=400&h=400`), and the first image is marked `isPrimary`.
- `averageRating` and `totalReviews` are randomized on each run.
- `Inventory` and stock rows are upserted automatically from `quantity`.
- Status defaults to `ACTIVE`.

**Image URLs** — the existing seed uses Unsplash URLs in the form
`https://images.unsplash.com/photo-<id>?w=800&h=800&fit=crop&q=80`. Pick IDs
that already appear in the seed when possible (they're proven to load) or
generic category-appropriate ones. Don't invent URLs that aren't real — broken
images degrade every product card.

**Category slug must exist.** If you need a new subcategory, add it to the
`children` array of the relevant top-level `CategorySeed` first, then reseed
once so the category row exists before products reference it.

## Common scenarios

### "Seed everything fresh"

```bash
cd packages/database && pnpm seed
```

Then run the global sanity query above to confirm counts are healthy.

### "I reset the DB / schema is out of sync"

```bash
cd packages/database
pnpm generate         # regenerate Prisma client
pnpm push             # sync schema → DB (dev flow)
pnpm seed
```

Use `pnpm reset` only when you want to blow the DB away — it's destructive.

### "Category X shows no products"

1. Run the per-leaf audit query above. If X has 0–2 products, extend `PRODUCTS`
   for `categorySlug: 'x'`. Aim for ≥ 3 entries so filters/sorts stay useful.
2. Re-run `pnpm seed`. Upsert means existing rows are untouched; new rows get
   created.
3. Re-run the audit to confirm.

### "Home page / deals page is sparse"

- Home featured: flip more `isFeatured` flags to `true` in `PRODUCTS`, or add
  featured products in thin categories.
- Deals: ensure `compareAtPrice > price` on more entries. The existing seed sets
  `compareAtPrice` on nearly every product — if deals is empty, suspect an
  env/DB issue rather than missing data.

### "`/admin` dashboard is empty"

Orders and customers are seeded by `seedCustomersAndOrders`. If it's empty, the
seed didn't complete — re-run and read the log for the "Seeded N orders" line.

## Gotchas learned the hard way

- **Don't invent new category slugs in `PRODUCTS` without adding the category
  first.** The seed skips products whose `categorySlug` doesn't resolve (logs a
  warning); the row silently never appears.
- **The `/collections/[slug]` route passes an unknown `collection=` query param
  to the API.** Nest's ValidationPipe strips unknown fields, so the endpoint
  returns the default listing. There's no need to seed a dedicated "collection"
  — but if the project later adds a real `Collection` model, this skill will
  need updating.
- **Parent categories aren't meant to carry direct products.** Don't "fix" a
  0-count on a parent by adding products to it — add them to the child leaves so
  `/categories/fashion` and `/categories/fashion/mens-clothing` both work.
- **`compareAtPrice` is only a "deal" when strictly greater than `price`.** The
  web client filters client-side (see `apps/web/src/app/(shop)/deals/page.tsx`).
  Don't set `compareAtPrice === price`.
- **Decimal fields accept numbers in the seed.** Prisma converts automatically —
  no need for `new Decimal(...)` or string prices.
- **Image `thumbnailUrl` is derived from the URL via string replace.** If you
  use a non-Unsplash URL, the derived thumbnail will just equal the full URL,
  which is fine but loads a little slower. Not a blocker.

## Exit criteria — when "seeded and healthy" is true

Before calling it done, confirm all of these:

1. `pnpm seed` printed "Seed completed successfully." with no warnings about
   skipped products.
2. Global sanity query: `ACTIVE products > 60`, `Featured > 20`, `Deals > 50`.
3. Per-leaf audit: no leaf category has `0` direct products. Ideally every leaf
   ≥ 3.
4. `curl -s http://localhost:3001/api/v1/products?limit=5 | jq '.data.products | length'`
   returns `5` (adjust port to whatever the API runs on — see
   `run-ecommerce-dev` skill) when the API is up. Skip this step if the API
   isn't running; the DB queries above are sufficient.

If any of those fail, the seed didn't finish or a leaf is thin — diagnose using
the queries, extend `PRODUCTS` as needed, reseed, and re-check.
