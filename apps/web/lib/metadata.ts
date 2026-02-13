import { Metadata } from 'next';

const SITE_NAME = 'BDShop';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bdshop.com.bd';
const DEFAULT_DESCRIPTION = 'Bangladesh\'s trusted online marketplace. Shop quality products at affordable prices with fast delivery across Bangladesh.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

interface SeoMetadata {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: 'en' | 'bn';
  noIndex?: boolean;
  keywords?: string[];
}

export function generateSiteMetadata(options: SeoMetadata): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_OG_IMAGE,
    url = SITE_URL,
    type = 'website',
    locale = 'en',
    noIndex = false,
    keywords = [],
  } = options;

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: ['BDShop', 'Bangladesh', 'online shopping', 'e-commerce', ...keywords],
    authors: [{ name: SITE_NAME }],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        en: url,
        bn: url.replace(SITE_URL, `${SITE_URL}/bn`),
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

interface ProductMetadata {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
  brand?: string;
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}

export function generateProductMetadata(product: ProductMetadata): Metadata {
  const title = `${product.name}${product.brand ? ` - ${product.brand}` : ''}`;
  const description = product.description.slice(0, 160);
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    ...generateSiteMetadata({
      title,
      description,
      image: product.image,
      url,
      type: 'product',
      keywords: [product.name, product.brand || '', product.category || '', 'buy online Bangladesh'],
    }),
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'BDT',
      'product:availability': product.inStock ? 'in stock' : 'out of stock',
      ...(product.brand && { 'product:brand': product.brand }),
    },
  };
}

interface CategoryMetadata {
  name: string;
  description?: string;
  slug: string;
  productCount?: number;
}

export function generateCategoryMetadata(category: CategoryMetadata): Metadata {
  return generateSiteMetadata({
    title: `${category.name} - Shop Online`,
    description: category.description || `Browse ${category.productCount || ''} ${category.name} products on BDShop. Best prices in Bangladesh with fast delivery.`,
    url: `${SITE_URL}/categories/${category.slug}`,
    keywords: [category.name, 'buy online', 'Bangladesh', 'best price'],
  });
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
