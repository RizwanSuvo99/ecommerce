import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface FacetResult {
  categories: FacetBucket[];
  brands: FacetBucket[];
  priceRange: PriceRange;
  priceRanges: FacetBucket[];
  ratings: FacetBucket[];
  availability: { inStock: number; outOfStock: number };
}

@Injectable()
export class FacetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate faceted filters for product listing.
   * Can be scoped by category or search query.
   */
  async getFacets(params: {
    categoryId?: string;
    query?: string;
  }): Promise<FacetResult> {
    const { categoryId, query } = params;

    const baseWhere: Record<string, unknown> = { isPublished: true };
    if (categoryId) baseWhere.categoryId = categoryId;

    // For query-based filtering, use a simpler approach
    if (query) {
      baseWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [
      categoryFacets,
      brandFacets,
      priceAgg,
      ratingFacets,
      availabilityFacets,
    ] = await Promise.all([
      // Category facets
      this.prisma.product.groupBy({
        by: ['categoryId'],
        where: baseWhere,
        _count: { id: true },
      }),

      // Brand facets
      this.prisma.product.groupBy({
        by: ['brandId'],
        where: baseWhere,
        _count: { id: true },
      }),

      // Price range
      this.prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
      }),

      // Rating distribution (from reviews)
      this.prisma.$queryRawUnsafe<{ rating: number; count: number }[]>(`
        SELECT
          FLOOR(COALESCE(AVG(r.rating), 0))::int AS rating,
          COUNT(DISTINCT p.id)::int AS count
        FROM products p
        LEFT JOIN reviews r ON r."productId" = p.id AND r.status = 'APPROVED'
        WHERE p."isPublished" = true
        ${categoryId ? `AND p."categoryId" = '${categoryId}'` : ''}
        GROUP BY FLOOR(COALESCE(AVG(r.rating), 0))
        HAVING FLOOR(COALESCE(AVG(r.rating), 0)) > 0
        ORDER BY rating DESC
      `),

      // Availability
      this.prisma.product.groupBy({
        by: ['stock'],
        where: baseWhere,
        _count: { id: true },
      }),
    ]);

    // Resolve category names
    const categoryIds = categoryFacets
      .map((f) => f.categoryId)
      .filter(Boolean) as string[];
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];

    // Resolve brand names
    const brandIds = brandFacets
      .map((f) => f.brandId)
      .filter(Boolean) as string[];
    const brands = brandIds.length
      ? await this.prisma.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, name: true },
        })
      : [];

    // Build price ranges (BDT)
    const minPrice = priceAgg._min.price ?? 0;
    const maxPrice = priceAgg._max.price ?? 10000;
    const priceRanges = this.buildPriceRanges(minPrice, maxPrice);

    // Calculate availability
    let inStock = 0;
    let outOfStock = 0;
    for (const f of availabilityFacets) {
      if ((f.stock as unknown as number) > 0) {
        inStock += f._count.id;
      } else {
        outOfStock += f._count.id;
      }
    }

    return {
      categories: categoryFacets.map((f) => {
        const cat = categories.find((c) => c.id === f.categoryId);
        return {
          value: f.categoryId ?? '',
          label: cat?.name ?? 'Uncategorized',
          count: f._count.id,
        };
      }),
      brands: brandFacets
        .filter((f) => f.brandId)
        .map((f) => {
          const brand = brands.find((b) => b.id === f.brandId);
          return {
            value: f.brandId ?? '',
            label: brand?.name ?? 'Unknown',
            count: f._count.id,
          };
        }),
      priceRange: { min: minPrice, max: maxPrice },
      priceRanges,
      ratings: ratingFacets.map((r) => ({
        value: String(r.rating),
        label: `${r.rating}+ stars`,
        count: r.count,
      })),
      availability: { inStock, outOfStock },
    };
  }

  private buildPriceRanges(min: number, max: number): FacetBucket[] {
    // BDT price ranges
    const ranges = [
      { min: 0, max: 500, label: 'Under ৳500' },
      { min: 500, max: 1000, label: '৳500 - ৳1,000' },
      { min: 1000, max: 2500, label: '৳1,000 - ৳2,500' },
      { min: 2500, max: 5000, label: '৳2,500 - ৳5,000' },
      { min: 5000, max: 10000, label: '৳5,000 - ৳10,000' },
      { min: 10000, max: Infinity, label: 'Over ৳10,000' },
    ];

    return ranges
      .filter((r) => r.min < max)
      .map((r) => ({
        value: `${r.min}-${r.max === Infinity ? '' : r.max}`,
        label: r.label,
        count: 0, // Count will be computed client-side or via a follow-up query
      }));
  }
}
