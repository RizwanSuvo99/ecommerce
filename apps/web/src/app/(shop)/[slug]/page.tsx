import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSiteConfig } from '@/lib/config/site-config';

interface CmsPageProps {
  params: { slug: string };
}

/** Shape returned by GET /pages/:slug — the parts we actually render. */
interface ApiPage {
  id: string;
  slug: string;
  title: string;
  titleBn?: string | null;
  content: string;
  contentBn?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle?: string | null;
  metaDescription?: string | null;
  updatedAt: string;
}

/** Resolve the API base URL for server-to-server calls. */
function apiBaseUrl(): string {
  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
}

/**
 * Fetch a CMS page by slug. Uses Next's tagged cache so admin edits
 * invalidate via the /api/revalidate webhook on tag `pages`. DRAFT /
 * ARCHIVED pages resolve to null so we never render them.
 */
async function getCmsPage(slug: string): Promise<ApiPage | null> {
  try {
    const res = await fetch(`${apiBaseUrl()}/pages/${slug}`, {
      next: { tags: ['pages', `page:${slug}`], revalidate: 300 },
      headers: { accept: 'application/json' },
    });
    if (!res.ok) {
      return null;
    }
    const payload = (await res.json()) as { data?: ApiPage } | ApiPage;
    const page = 'data' in payload && payload.data ? payload.data : (payload as ApiPage);
    if (!page || page.status !== 'PUBLISHED') {
      return null;
    }
    return page;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const page = await getCmsPage(params.slug);
  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.excerpt ?? undefined,
  };
}

/**
 * Catch-all CMS page renderer for /about-us, /privacy-policy,
 * /terms-conditions, and any slug the admin creates in /admin/pages.
 *
 * Content is stored as HTML in the DB, written by the admin's rich-text
 * editor. Rendering via `dangerouslySetInnerHTML` is intentional — the
 * admin is the trusted author. If this ever changes (e.g. multi-tenant
 * authoring), sanitize server-side with isomorphic-dompurify before the
 * render. Consider that a Phase-8 gate.
 */
export default async function CmsPage({ params }: CmsPageProps) {
  const page = await getCmsPage(params.slug);
  if (!page) {
    notFound();
  }

  const { settings } = await getSiteConfig();
  const locale = settings.general.default_language === 'bn' ? 'bn' : 'en';

  const title = locale === 'bn' && page.titleBn ? page.titleBn : page.title;
  const content = locale === 'bn' && page.contentBn ? page.contentBn : page.content;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        Last updated:{' '}
        {new Date(page.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}
