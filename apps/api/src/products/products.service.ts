import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

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

      // Regenerate with new random suffix
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      currentSku = `${sku.split('-')[0]}-${random}${Date.now().toString(36).toUpperCase().slice(-3)}`;
    }
  }

  /**
   * Creates a new product with auto-generated slug and SKU.
   */
  async create(dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);

    // Generate and ensure unique slug
    const rawSlug = this.generateSlug(dto.name);
    const slug = await this.ensureUniqueSlug(rawSlug);

    // Generate and ensure unique SKU
    const rawSku = this.generateSku(dto.name);
    const sku = await this.ensureUniqueSku(rawSku);

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${dto.categoryId}" not found`);
    }

    // Verify brand exists if provided
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID "${dto.brandId}" not found`);
      }
    }

    // Create the product
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
}
