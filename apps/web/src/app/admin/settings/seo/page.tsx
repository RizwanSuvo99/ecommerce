'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface SeoSettings {
  meta_title: string;
  meta_title_bn: string;
  meta_description: string;
  meta_description_bn: string;
  meta_keywords: string;
  og_image: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
  robots_txt: string;
  canonical_url: string;
}

const DEFAULTS: SeoSettings = {
  meta_title: '',
  meta_title_bn: '',
  meta_description: '',
  meta_description_bn: '',
  meta_keywords: '',
  og_image: '',
  google_analytics_id: '',
  facebook_pixel_id: '',
  robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
  canonical_url: '',
};

export default function SeoSettingsPage() {
  const [form, setForm] = useState<SeoSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsByGroup('seo')
      .then((data) => setForm({ ...DEFAULTS, ...data } as SeoSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SeoSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('seo', form as unknown as Record<string, string>);
      toast.success('SEO settings saved');
    } catch {
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading SEO settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>

      {/* Meta Tags */}
      <section className="space-y-4">
        <h3 className="font-medium text-gray-800">Meta Tags</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Title (English)</label>
            <input
              type="text"
              maxLength={70}
              value={form.meta_title}
              onChange={(e) => handleChange('meta_title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-gray-400">{form.meta_title.length}/70 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">মেটা টাইটেল (বাংলা)</label>
            <input
              type="text"
              maxLength={70}
              value={form.meta_title_bn}
              onChange={(e) => handleChange('meta_title_bn', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-gray-400">{form.meta_title_bn.length}/70 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Description (English)</label>
            <textarea
              maxLength={160}
              rows={3}
              value={form.meta_description}
              onChange={(e) => handleChange('meta_description', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-gray-400">{form.meta_description.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">মেটা বিবরণ (বাংলা)</label>
            <textarea
              maxLength={160}
              rows={3}
              value={form.meta_description_bn}
              onChange={(e) => handleChange('meta_description_bn', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
            <p className="mt-1 text-xs text-gray-400">{form.meta_description_bn.length}/160 characters</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Keywords</label>
          <input
            type="text"
            value={form.meta_keywords}
            onChange={(e) => handleChange('meta_keywords', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="online shopping, bangladesh, ecommerce"
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated keywords</p>
        </div>
      </section>

      {/* OG Image */}
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Open Graph Image</h3>
        <input
          type="url"
          value={form.og_image}
          onChange={(e) => handleChange('og_image', e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="https://example.com/og-image.jpg"
        />
        <p className="text-xs text-gray-400">Recommended: 1200 x 630 pixels</p>
      </section>

      {/* Analytics */}
      <section className="space-y-4">
        <h3 className="font-medium text-gray-800">Analytics & Tracking</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
            <input
              type="text"
              value={form.google_analytics_id}
              onChange={(e) => handleChange('google_analytics_id', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
            <input
              type="text"
              value={form.facebook_pixel_id}
              onChange={(e) => handleChange('facebook_pixel_id', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="123456789012345"
            />
          </div>
        </div>
      </section>

      {/* Robots.txt */}
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">robots.txt</h3>
        <textarea
          rows={5}
          value={form.robots_txt}
          onChange={(e) => handleChange('robots_txt', e.target.value)}
          className="block w-full font-mono text-sm rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-teal-500"
        />
      </section>

      {/* Canonical URL */}
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Canonical URL</h3>
        <input
          type="url"
          value={form.canonical_url}
          onChange={(e) => handleChange('canonical_url', e.target.value)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
          placeholder="https://www.example.com"
        />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </form>
  );
}
