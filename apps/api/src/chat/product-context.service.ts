import { Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import type { ChatProductCard } from './types/chat.types';

export interface SearchToolParams {
  query?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}

@Injectable()
export class ProductContextService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async searchProducts(
    params: SearchToolParams,
  ): Promise<{ products: ChatProductCard[]; total: number }> {
    const sortByMap: Record<string, string> = {
      price: 'price',
      createdAt: 'createdAt',
      averageRating: 'averageRating',
      name: 'name',
      viewCount: 'viewCount',
    };

    const result = await this.productsService.findAll({
      search: params.query,
      categorySlug: params.categorySlug,
      brandSlug: params.brandSlug,
      priceMin: params.minPrice,
      priceMax: params.maxPrice,
      isFeatured: params.isFeatured,
      sortBy: sortByMap[params.sortBy || ''] as any,
      sortOrder: (params.sortOrder as any) || 'desc',
      limit: params.limit || 5,
      page: 1,
      status: 'ACTIVE' as any,
    });

    const products: ChatProductCard[] = result.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      image: p.images?.[0]?.url || null,
      category: p.category?.name || '',
      brand: p.brand?.name || null,
      averageRating: Number(p.averageRating) || 0,
      totalReviews: p.totalReviews || p._count?.reviews || 0,
      inStock: (p.quantity || 0) > 0,
      shortDescription: p.shortDescription || null,
    }));

    return { products, total: result.meta.total };
  }

  async getProductDetails(slug: string): Promise<ChatProductCard | null> {
    try {
      const p: any = await this.productsService.findBySlug(slug);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        image: p.images?.[0]?.url || null,
        category: p.category?.name || '',
        brand: p.brand?.name || null,
        averageRating: Number(p.averageRating) || 0,
        totalReviews: p.totalReviews || 0,
        inStock: (p.quantity || 0) > 0,
        shortDescription: p.shortDescription || p.description?.slice(0, 200) || null,
      };
    } catch {
      return null;
    }
  }

  async listCategories(): Promise<
    { name: string; slug: string; productCount: number; children: string[] }[]
  > {
    const tree = await this.categoriesService.findAll();

    return tree.map((node: any) => ({
      name: node.name,
      slug: node.slug,
      productCount: node.productCount || 0,
      children: (node.children || []).map((c: any) => c.name),
    }));
  }

  async compareProducts(slugs: string[]): Promise<ChatProductCard[]> {
    const results: ChatProductCard[] = [];

    for (const slug of slugs.slice(0, 5)) {
      const product = await this.getProductDetails(slug);
      if (product) {
        results.push(product);
      }
    }

    return results;
  }
}
