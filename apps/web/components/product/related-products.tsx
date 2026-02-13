'use client';

import { ProductCard } from './product-card';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  title?: string;
}

export function RelatedProducts({ products, title = 'Related Products' }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        ))}
      </div>
    </section>
  );
}
