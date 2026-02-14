'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';

import { apiClient } from '@/lib/api/client';

interface Category {
  id: string;
  name: string;
  nameBn: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  productCount?: number;
  _count?: { products: number };
  children?: Category[];
}

function getCatProductCount(cat: Category): number {
  const own = cat.productCount ?? cat._count?.products ?? 0;
  const childTotal = (cat.children ?? []).reduce(
    (sum, c) => sum + getCatProductCount(c),
    0,
  );
  return own + childTotal;
}

// Category background images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop&q=80',
  fashion:
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop&q=80',
  'home-living':
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop&q=80',
  'beauty-health':
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&q=80',
  groceries:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&q=80',
  'baby-kids':
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop&q=80',
  'sports-outdoors':
    'https://images.unsplash.com/photo-1461896836934-bd45ba8a0bca?w=800&h=600&fit=crop&q=80',
  'books-stationery':
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&h=600&fit=crop&q=80',
  automotive:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80',
  pets: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&q=80',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/categories?tree=true')
      .then(({ data }) => {
        setCategories(data.data ?? data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = categories.reduce(
    (sum, cat) => sum + getCatProductCount(cat),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600">
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-10 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute right-1/3 top-10 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <nav className="mb-6 flex items-center gap-2 text-sm text-teal-100">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">Categories</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Browse Categories
            </h1>
          </div>

          <p className="max-w-xl text-teal-100 text-lg">
            Explore our wide range of products across{' '}
            <span className="font-semibold text-white">
              {categories.length} categories
            </span>
            {totalProducts > 0 && (
              <>
                {' '}
                with{' '}
                <span className="font-semibold text-white">
                  {totalProducts.toLocaleString()}+
                </span>{' '}
                products
              </>
            )}
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl bg-gray-200 ${i < 2 ? 'sm:row-span-2 h-80 lg:h-[420px]' : 'h-56'}`}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center">
            <LayoutGrid className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-500">
              No categories found.
            </p>
            <p className="mt-2 text-gray-400">
              Check back soon for new arrivals!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((cat, idx) => {
              const totalCount = getCatProductCount(cat);
              const hasChildren = cat.children && cat.children.length > 0;
              const isTall = idx < 2;
              const bgImage = CATEGORY_IMAGES[cat.slug];

              // Skip categories with zero products and no children
              if (totalCount === 0 && !hasChildren) return null;

              return (
                <section key={cat.id}>
                  {/* Parent category card */}
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={`group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      isTall ? 'h-72 sm:h-80' : 'h-56'
                    }`}
                  >
                    {bgImage ? (
                      <img
                        src={bgImage}
                        alt={cat.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-emerald-700" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-gray-900/10 group-hover:from-gray-900/85" />

                    <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                      {totalCount > 0 && (
                        <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-teal-500/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          <Sparkles className="h-3 w-3" />
                          {totalCount} products
                        </span>
                      )}

                      <h3 className="text-xl font-bold text-white sm:text-2xl">
                        {cat.name}
                      </h3>

                      {cat.nameBn && (
                        <p className="mt-0.5 text-sm text-gray-300">
                          {cat.nameBn}
                        </p>
                      )}

                      {cat.description && isTall && (
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/20">
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </Link>

                  {/* Subcategory grid */}
                  {hasChildren && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {cat.children!.map((sub) => {
                        const subCount =
                          sub.productCount ?? sub._count?.products ?? 0;
                        return (
                          <Link
                            key={sub.id}
                            href={`/categories/${sub.slug}`}
                            className="group/sub flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover/sub:text-teal-700 truncate">
                              {sub.name}
                            </span>
                            {subCount > 0 && (
                              <span className="ml-2 flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 group-hover/sub:bg-teal-50 group-hover/sub:text-teal-600">
                                {subCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
