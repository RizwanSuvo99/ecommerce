import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto, ProductSortBy, SortOrder } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a URL-friendly slug from a product name.
   * Appends a random suffix to ensure uniqueness.
   */
  generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    const suffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${suffix}`;
  }

  /**
   * Generates a unique SKU from a product name.
   */
  generateSku(name: string): string {
    const prefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);

    const uniquePart = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    return `${prefix}-${uniquePart}${random}`;
  }

  /**
   * Ensures slug uniqueness by appending a counter if necessary.
   */
  private async ensureUniqueSlug(slug: string): Promise<string> {
    let currentSlug = slug;
    let counter = 0;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: currentSlug },
        select: { id: true },
      });

      if (!existing) {
        return currentSlug;
      }

      counter++;
      currentSlug = `${slug}-${counter}`;
    }
  }

  /**
   * Ensures SKU uniqueness by regenerating if necessary.
   */
  private async ensureUniqueSku(sku: string): Promise<string> {
    let currentSku = sku;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: currentSku },
        select: { id: true },
      });

      if (!existing) {
        return currentSku;
      }

      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      currentSku = `${sku.split('-')[0]}-${random}${Date.now().toString(36).toUpperCase().slice(-3)}`;
    }
  }

  /**
   * Creates a new product with auto-generated slug and SKU.
   */
  async create(dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);

    const rawSlug = this.generateSlug(dto.name);
    const slug = await this.ensureUniqueSlug(rawSlug);

    const rawSku = this.generateSku(dto.name);
    const sku = await this.ensureUniqueSku(rawSku);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID "${dto.brandId}" not found`);
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        nameBn: dto.nameBn,
        slug,
        description: dto.description,
        descriptionBn: dto.descriptionBn,
        shortDescription: dto.shortDescription,
        sku,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        quantity: dto.quantity ?? 0,
        status: dto.status ?? 'DRAFT',
        category: { connect: { id: dto.categoryId } },
        brand: dto.brandId ? { connect: { id: dto.brandId } } : undefined,
        tags: dto.tags ?? [],
        weight: dto.weight,
        weightUnit: dto.weightUnit ?? 'kg',
        length: dto.length,
        width: dto.width,
        height: dto.height,
        isFeatured: dto.isFeatured ?? false,
        isDigital: dto.isDigital ?? false,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: true,
      },
    });

    this.logger.log(`Product created: ${product.id} (${product.slug})`);
    return product;
  }

  /**
   * Find all products with pagination, sorting, and filtering.
   */
  async findAll(filters: ProductFilterDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      categoryId,
      categorySlug,
      brandId,
      brandSlug,
      priceMin,
      priceMax,
      search,
      status,
      tag,
      isFeatured,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Prisma.ProductWhereInput = {};

    // Status filter (default to ACTIVE for public queries)
    if (status) {
      where.status = status;
    }

    // Category filters
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Brand filters
    if (brandId) {
      where.brandId = brandId;
    } else if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) {
        where.price.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.price.lte = priceMax;
      }
    }

    // Search filter (name, description, tags)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Tag filter
    if (tag) {
      where.tags = { has: tag };
    }

    // Featured filter
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              alt: true,
            },
          },
          _count: {
            select: { reviews: true, variants: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
