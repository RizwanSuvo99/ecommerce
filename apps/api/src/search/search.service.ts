import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  inStock?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  images: string[];
  averageRating: number | null;
  reviewCount: number;
  categoryName: string | null;
  brandName: string | null;
  rank: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Full-text search using PostgreSQL ts_vector and ts_rank.
   * Searches product name, description, and SKU.
   */
  async search(params: SearchParams) {
    const {
      query,
      page = 1,
      limit = 20,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      inStock,
    } = params;

    const offset = (page - 1) * limit;

    // Build the search query using PostgreSQL full-text search
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}:*`)
      .join(' & ');

    if (!tsQuery) {
      return { products: [], pagination: { total: 0, page, limit, pages: 0 } };
    }

    // Build WHERE conditions
    const conditions: string[] = [
      `p."isPublished" = true`,
      `(
        to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.sku, ''))
        @@ to_tsquery('english', $1)
      )`,
    ];

    const queryParams: (string | number | boolean)[] = [tsQuery];
    let paramIndex = 2;

    if (categoryId) {
      conditions.push(`p."categoryId" = $${paramIndex}`);
      queryParams.push(categoryId);
      paramIndex++;
    }

    if (brandId) {
      conditions.push(`p."brandId" = $${paramIndex}`);
      queryParams.push(brandId);
      paramIndex++;
    }

    if (minPrice !== undefined) {
      conditions.push(`COALESCE(p."salePrice", p.price) >= $${paramIndex}`);
      queryParams.push(minPrice);
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      conditions.push(`COALESCE(p."salePrice", p.price) <= $${paramIndex}`);
      queryParams.push(maxPrice);
      paramIndex++;
    }

    if (inStock) {
      conditions.push(`p.stock > 0`);
    }

    const whereClause = conditions.join(' AND ');

    // Sort order
    const orderClause =
      sortBy === 'price_asc'
        ? 'COALESCE(p."salePrice", p.price) ASC'
        : sortBy === 'price_desc'
          ? 'COALESCE(p."salePrice", p.price) DESC'
          : sortBy === 'newest'
            ? 'p."createdAt" DESC'
            : sortBy === 'rating'
              ? 'avg_rating DESC NULLS LAST'
              : 'rank DESC';

    const sql = `
      SELECT
        p.id, p.name, p.slug, p.description, p.price, p."salePrice", p.images,
        c.name AS "categoryName",
        b.name AS "brandName",
        COALESCE(AVG(r.rating), 0) AS "averageRating",
        COUNT(r.id)::int AS "reviewCount",
        ts_rank(
          to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.sku, '')),
          to_tsquery('english', $1)
        ) AS rank
      FROM products p
      LEFT JOIN categories c ON c.id = p."categoryId"
      LEFT JOIN brands b ON b.id = p."brandId"
      LEFT JOIN reviews r ON r."productId" = p.id AND r.status = 'APPROVED'
      WHERE ${whereClause}
      GROUP BY p.id, c.name, b.name
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(DISTINCT p.id)::int AS total
      FROM products p
      WHERE ${whereClause}
    `;

    const [products, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<SearchResult[]>(sql, ...queryParams),
      this.prisma.$queryRawUnsafe<[{ total: number }]>(countSql, ...queryParams),
    ]);

    const total = countResult[0]?.total ?? 0;

    return {
      products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }
}
