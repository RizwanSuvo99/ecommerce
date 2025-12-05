// ──────────────────────────────────────────────────────────
// Product types — shared between API and Web
// ──────────────────────────────────────────────────────────

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  attributes: ProductAttribute[];
  images: ProductImage[];
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  isActive: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  status: ProductStatus;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  isFeatured: boolean;
  isDigital: boolean;
  averageRating: number;
  totalReviews: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  status?: ProductStatus;
  categoryId: string;
  brandId?: string;
  tags?: string[];
  images?: Omit<ProductImage, 'id'>[];
  variants?: Omit<ProductVariant, 'id'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  isFeatured?: boolean;
  isDigital?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface ProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isFeatured?: boolean;
  inStock?: boolean;
}
