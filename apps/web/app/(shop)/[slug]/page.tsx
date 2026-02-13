import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CmsPageProps {
  params: { slug: string };
}

interface CmsPage {
  id: string;
  slug: string;
  title: { en: string; bn: string };
  content: { en: string; bn: string };
  seoTitle?: { en: string; bn: string };
  seoDescription?: { en: string; bn: string };
  publishedAt: string;
  updatedAt: string;
}

// In production, this fetches from the API
async function getCmsPage(slug: string): Promise<CmsPage | null> {
  const pages: Record<string, CmsPage> = {
    about: {
      id: '1', slug: 'about',
      title: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
      content: {
        en: '<h2>Welcome to BDShop</h2><p>BDShop is Bangladesh\'s trusted online marketplace, connecting buyers with quality local and international products. Founded in 2024, we are committed to making e-commerce accessible to every Bangladeshi.</p><h3>Our Mission</h3><p>To provide an affordable, reliable, and enjoyable shopping experience while supporting local businesses and artisans across Bangladesh.</p><h3>Why Choose BDShop?</h3><ul><li>Authentic products from verified sellers</li><li>Competitive prices in BDT</li><li>Fast delivery across Bangladesh</li><li>Secure payment options including bKash, Nagad, and COD</li><li>Dedicated customer support in Bengali and English</li></ul>',
        bn: '<h2>বিডিশপ-এ স্বাগতম</h2><p>বিডিশপ বাংলাদেশের একটি বিশ্বস্ত অনলাইন মার্কেটপ্লেস, যা ক্রেতাদের মানসম্পন্ন দেশীয় ও আন্তর্জাতিক পণ্যের সাথে সংযুক্ত করে। ২০২৪ সালে প্রতিষ্ঠিত, আমরা প্রতিটি বাংলাদেশীর কাছে ই-কমার্সকে সুলভ করতে প্রতিশ্রুতিবদ্ধ।</p>',
      },
      seoTitle: { en: 'About BDShop - Bangladesh Online Marketplace', bn: 'বিডিশপ সম্পর্কে' },
      seoDescription: {
        en: 'Learn about BDShop, Bangladesh\'s trusted online marketplace for quality products at affordable prices.',
        bn: 'বিডিশপ সম্পর্কে জানুন, বাংলাদেশের বিশ্বস্ত অনলাইন মার্কেটপ্লেস।',
      },
      publishedAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-10T00:00:00Z',
    },
    privacy: {
      id: '2', slug: 'privacy',
      title: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
      content: {
        en: '<h2>Privacy Policy</h2><p>This Privacy Policy explains how BDShop collects, uses, and protects your personal information.</p><h3>Information We Collect</h3><p>We collect information you provide when creating an account, placing orders, or contacting support.</p>',
        bn: '<h2>গোপনীয়তা নীতি</h2><p>এই গোপনীয়তা নীতি ব্যাখ্যা করে কিভাবে বিডিশপ আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করে।</p>',
      },
      publishedAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
    terms: {
      id: '3', slug: 'terms',
      title: { en: 'Terms of Service', bn: 'সেবা শর্তাবলী' },
      content: {
        en: '<h2>Terms of Service</h2><p>By using BDShop, you agree to these Terms of Service.</p>',
        bn: '<h2>সেবা শর্তাবলী</h2><p>বিডিশপ ব্যবহার করে আপনি এই সেবা শর্তাবলীতে সম্মত হচ্ছেন।</p>',
      },
      publishedAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  };

  return pages[slug] || null;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const page = await getCmsPage(params.slug);
  if (!page) return { title: 'Page Not Found' };

  return {
    title: page.seoTitle?.en || page.title.en,
    description: page.seoDescription?.en,
    alternates: {
      languages: { bn: `/bn/${params.slug}` },
    },
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const page = await getCmsPage(params.slug);
  if (!page) notFound();

  const locale = 'en'; // In production, from next-intl

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {locale === 'bn' ? page.title.bn : page.title.en}
      </h1>
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-teal-600"
        dangerouslySetInnerHTML={{
          __html: locale === 'bn' ? page.content.bn : page.content.en,
        }}
      />
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>
    </div>
  );
}
