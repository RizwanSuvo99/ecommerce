# ADR 004: Internationalization Strategy

## Status

Accepted

## Date

2026-01-12

## Context

The platform needs to support bilingual content in English and Bangla (Bengali). This affects:

- UI labels and messages
- Product content (names, descriptions)
- Category and brand names
- CMS pages
- Email templates
- Error messages
- Date, number, and currency formatting

Options considered:

1. **next-intl**: Next.js-specific i18n library
2. **react-i18next**: Popular React i18n framework
3. **Custom solution**: Built-in bilingual field approach
4. **Hybrid**: next-intl for UI + bilingual database fields

## Decision

We chose a **hybrid approach**:

1. **next-intl** for UI strings (labels, messages, navigation)
2. **Bilingual database fields** for dynamic content (products, categories)
3. **BDT currency** formatting with Bangla numerals support

### UI Strings (next-intl)

```
messages/
├── en.json    # English translations
└── bn.json    # Bangla translations
```

### Database Fields

```prisma
model Product {
  name          String    // English name
  nameBn        String?   // Bangla name (বাংলা নাম)
  description   String    // English description
  descriptionBn String?   // Bangla description
}
```

### URL Structure

```
/en/products/...    → English
/bn/products/...    → Bangla (বাংলা)
```

## Rationale

### Why next-intl?

- Built specifically for Next.js App Router
- Server component support (reduces client bundle)
- Type-safe message keys
- Built-in formatting for dates, numbers, currencies
- ICU message format support

### Why bilingual fields instead of a translations table?

- Simpler queries (no joins needed)
- Only two languages needed (English + Bangla)
- Better performance for product listings
- Easier content management for admin panel
- Bangla content is optional (English is primary)

### Why not a full translations table?

- Over-engineering for two languages
- Adds query complexity
- Would be needed only if supporting 3+ languages
- Can migrate later if more languages needed

## Consequences

### Positive

- Server-side rendering for SEO in both languages
- Simple database model for bilingual content
- Good developer experience with type-safe translations
- Bangla numerals and currency formatting support
- URL-based locale switching

### Negative

- Adding a third language would require schema changes
- Bilingual fields double the content columns
- Admin needs to manage content in two languages
- Some SEO duplication for bilingual pages
