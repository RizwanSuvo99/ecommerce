interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string | string[];
  sku: string;
  brand: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  url: string;
  category?: string;
}

export function ProductJsonLd({
  name, description, image, sku, brand, price,
  originalPrice: _originalPrice, currency = 'BDT', inStock, rating,
  reviewCount, url, category,
}: ProductJsonLdProps) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    sku,
    brand: { '@type': 'Brand', name: brand },
    category,
    url,
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: currency,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url,
      seller: {
        '@type': 'Organization',
        name: 'BDShop',
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  };

  if (rating && reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return <JsonLd data={data} />;
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
}

export function OrganizationJsonLd({
  name = 'BDShop',
  url = 'https://bdshop.com.bd',
  logo = 'https://bdshop.com.bd/images/logo.png',
}: OrganizationJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs: [
      'https://facebook.com/bdshop',
      'https://instagram.com/bdshop',
      'https://youtube.com/bdshop',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1700-000000',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Gulshan-2',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
      postalCode: '1212',
    },
  };

  return <JsonLd data={data} />;
}

interface FaqJsonLdProps {
  questions: { question: string; answer: string }[];
}

export function FaqJsonLd({ questions }: FaqJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}
