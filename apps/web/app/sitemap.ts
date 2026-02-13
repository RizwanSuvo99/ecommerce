import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bdshop.com.bd';

interface ProductEntry {
  slug: string;
  updatedAt: string;
}

interface CategoryEntry {
  slug: string;
  updatedAt: string;
}

interface PageEntry {
  slug: string;
  updatedAt: string;
}

async function fetchProducts(): Promise<ProductEntry[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/products/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [
      { slug: 'premium-cotton-panjabi', updatedAt: '2026-02-13' },
      { slug: 'jamdani-saree-royal-blue', updatedAt: '2026-02-12' },
      { slug: 'wireless-earbuds-pro', updatedAt: '2026-02-11' },
      { slug: 'leather-messenger-bag', updatedAt: '2026-02-10' },
    ];
  }
}

async function fetchCategories(): Promise<CategoryEntry[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/categories/sitemap`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [
      { slug: 'clothing', updatedAt: '2026-02-10' },
      { slug: 'electronics', updatedAt: '2026-02-10' },
      { slug: 'home-living', updatedAt: '2026-02-10' },
      { slug: 'beauty-health', updatedAt: '2026-02-10' },
    ];
  }
}

async function fetchPages(): Promise<PageEntry[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/pages/sitemap`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [
      { slug: 'about', updatedAt: '2026-02-01' },
      { slug: 'contact', updatedAt: '2026-02-01' },
      { slug: 'privacy', updatedAt: '2026-01-15' },
      { slug: 'terms', updatedAt: '2026-01-15' },
    ];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchPages(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const cmsPages: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...cmsPages];
}
