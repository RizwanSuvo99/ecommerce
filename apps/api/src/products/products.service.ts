import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto, ProductSortBy, SortOrder } from './dto/product-filter.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Utility Methods ────────────────────────────────────────────────────────

  /**
   * Generates a URL-friendly slug from a product name.
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
   * Generates a variant SKU from the product slug and attribute values.
   */
  generateVariantSku(productSlug: string, attributeValues: string[]): string {
    const base = productSlug
      .toUpperCase()
      .replace(/-/g, '')
      .substring(0, 6);

    const attrPart = attributeValues
      .map((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3))
      .join('-');

    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    return attrPart ? `${base}-${attrPart}-${random}` : `${base}-VAR-${random}`;
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let currentSlug = slug;
    let counter = 0;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: currentSlug },
        select: { id: true },
      });

      if (!existing || existing.id === excludeId) {
        return currentSlug;
      }

      counter++;
      currentSlug = `${slug}-${counter}`;
    }
  }

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

  private async ensureUniqueVariantSku(sku: string): Promise<string> {
    let currentSku = sku;

    while (true) {
      const existing = await this.prisma.productVariant.findUnique({
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

  // ─── Product CRUD ───────────────────────────────────────────────────────────

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

    const where: Prisma.ProductWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brandId) {
      where.brandId = brandId;
    } else if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) {
        where.price.gte = priceMin;
      }
      if (priceMax !== undefined) {
        where.price.lte = priceMax;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameBn: true,
            slug: true,
            parent: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        brand: {
          select: { id: true, name: true, nameBn: true, slug: true, logo: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            attributeValues: {
              include: {
                attribute: {
                  select: { id: true, name: true, type: true },
                },
              },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                alt: true,
              },
            },
          },
        },
        attributes: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            type: true,
            values: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            alt: true,
            width: true,
            height: true,
            isPrimary: true,
            sortOrder: true,
            blurHash: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    const reviewStats = await this.prisma.review.aggregate({
      where: {
        productId: product.id,
        status: 'APPROVED',
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId: product.id,
        status: 'APPROVED',
      },
      _count: { rating: true },
    });

    this.incrementViewCount(product.id).catch((err) => {
      this.logger.warn(`Failed to increment view count for product ${product.id}: ${err.message}`);
    });

    return {
      ...product,
      reviewSummary: {
        averageRating: reviewStats._avg.rating ?? 0,
        totalReviews: reviewStats._count.rating,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          },
          {} as Record<number, number>,
        ),
      },
    };
  }

  private async incrementViewCount(productId: string): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    this.logger.log(`Updating product: ${id}`);

    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;

      if (dto.name !== existing.name) {
        const rawSlug = this.generateSlug(dto.name);
        updateData.slug = await this.ensureUniqueSlug(rawSlug, id);
      }
    }

    if (dto.nameBn !== undefined) updateData.nameBn = dto.nameBn;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.descriptionBn !== undefined) updateData.descriptionBn = dto.descriptionBn;
    if (dto.shortDescription !== undefined) updateData.shortDescription = dto.shortDescription;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.compareAtPrice !== undefined) updateData.compareAtPrice = dto.compareAtPrice;
    if (dto.costPrice !== undefined) updateData.costPrice = dto.costPrice;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.weightUnit !== undefined) updateData.weightUnit = dto.weightUnit;
    if (dto.length !== undefined) updateData.length = dto.length;
    if (dto.width !== undefined) updateData.width = dto.width;
    if (dto.height !== undefined) updateData.height = dto.height;
    if (dto.isFeatured !== undefined) updateData.isFeatured = dto.isFeatured;
    if (dto.isDigital !== undefined) updateData.isDigital = dto.isDigital;
    if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) updateData.metaDescription = dto.metaDescription;

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
      }

      updateData.category = { connect: { id: dto.categoryId } };
    }

    if (dto.brandId !== undefined) {
      if (dto.brandId) {
        const brand = await this.prisma.brand.findUnique({
          where: { id: dto.brandId },
          select: { id: true },
        });

        if (!brand) {
          throw new NotFoundException(`Brand with ID "${dto.brandId}" not found`);
        }

        updateData.brand = { connect: { id: dto.brandId } };
      } else {
        updateData.brand = { disconnect: true };
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { reviews: true, variants: true },
        },
      },
    });

    this.logger.log(`Product updated: ${product.id} (${product.slug})`);
    return product;
  }

  async archive(id: string) {
    this.logger.log(`Archiving product: ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.status === 'ARCHIVED') {
      this.logger.warn(`Product ${id} is already archived`);
      return this.prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      });
    }

    const archived = await this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    this.logger.log(`Product archived: ${id}`);
    return archived;
  }

  async permanentDelete(id: string) {
    this.logger.log(`Permanently deleting product: ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product._count.orderItems > 0) {
      throw new ForbiddenException(
        `Cannot permanently delete product "${product.name}" because it has ${product._count.orderItems} associated order item(s). Archive it instead.`,
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(`Product permanently deleted: ${id} (${product.slug})`);
    return { deleted: true, id, name: product.name };
  }

  // ─── Variant Management ─────────────────────────────────────────────────────

  /**
   * Create a new variant for a product.
   * Auto-generates SKU from product slug + attribute values.
   */
  async createVariant(productId: string, dto: CreateVariantDto) {
    this.logger.log(`Creating variant for product: ${productId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    // Auto-generate SKU from product slug and attribute values
    const attrValues = dto.attributeValues?.map((av) => av.value) ?? [];
    const rawSku = this.generateVariantSku(product.slug, attrValues);
    const sku = await this.ensureUniqueVariantSku(rawSku);

    // Determine next sort order
    const lastVariant = await this.prisma.productVariant.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const nextSortOrder = dto.sortOrder ?? (lastVariant ? lastVariant.sortOrder + 1 : 0);

    const variant = await this.prisma.productVariant.create({
      data: {
        product: { connect: { id: productId } },
        name: dto.name,
        sku,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        quantity: dto.quantity ?? 0,
        weight: dto.weight,
        weightUnit: dto.weightUnit ?? 'kg',
        isActive: dto.isActive ?? true,
        sortOrder: nextSortOrder,
        attributeValues: dto.attributeValues
          ? {
              create: dto.attributeValues.map((av) => ({
                attribute: { connect: { id: av.attributeId } },
                value: av.value,
              })),
            }
          : undefined,
      },
      include: {
        attributeValues: {
          include: {
            attribute: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });

    this.logger.log(`Variant created: ${variant.id} (${variant.sku})`);
    return variant;
  }

  /**
   * Update an existing variant.
   */
  async updateVariant(productId: string, variantId: string, dto: UpdateVariantDto) {
    this.logger.log(`Updating variant ${variantId} for product ${productId}`);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variant with ID "${variantId}" not found for product "${productId}"`,
      );
    }

    const updateData: Prisma.ProductVariantUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.compareAtPrice !== undefined) updateData.compareAtPrice = dto.compareAtPrice;
    if (dto.costPrice !== undefined) updateData.costPrice = dto.costPrice;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.weightUnit !== undefined) updateData.weightUnit = dto.weightUnit;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

    // If attribute values are provided, replace them
    if (dto.attributeValues) {
      // Delete existing attribute values
      await this.prisma.productVariantAttributeValue.deleteMany({
        where: { variantId },
      });

      // Create new attribute values
      updateData.attributeValues = {
        create: dto.attributeValues.map((av) => ({
          attribute: { connect: { id: av.attributeId } },
          value: av.value,
        })),
      };
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: {
        attributeValues: {
          include: {
            attribute: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });

    this.logger.log(`Variant updated: ${updated.id}`);
    return updated;
  }

  /**
   * Delete a variant from a product.
   */
  async deleteVariant(productId: string, variantId: string) {
    this.logger.log(`Deleting variant ${variantId} from product ${productId}`);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: {
        id: true,
        sku: true,
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException(
        `Variant with ID "${variantId}" not found for product "${productId}"`,
      );
    }

    if (variant._count.orderItems > 0) {
      throw new ForbiddenException(
        `Cannot delete variant "${variant.sku}" because it has associated order items. Deactivate it instead.`,
      );
    }

    await this.prisma.productVariant.delete({
      where: { id: variantId },
    });

    this.logger.log(`Variant deleted: ${variantId} (${variant.sku})`);
    return { deleted: true, id: variantId, sku: variant.sku };
  }
}
