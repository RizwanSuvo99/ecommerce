'use client';

import { useEffect, useState } from 'react';

import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface SeoSettings {
  metaTitleEn: string;
  metaTitleBn: string;
  metaDescriptionEn: string;
  metaDescriptionBn: string;
  ogImage: string;
  googleAnalyticsId: string;
  fbPixelId: string;
  robotsTxt: string;
  canonicalUrl: string;
}

const DEFAULTS: SeoSettings = {
  metaTitleEn: '',
  metaTitleBn: '',
  metaDescriptionEn: '',
  metaDescriptionBn: '',
  ogImage: '',
  googleAnalyticsId: '',
  fbPixelId: '',
  robotsTxt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
  canonicalUrl: '',
};

export default function SeoSettingsPage() {
  const [form, setForm] = useState<SeoSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettingsByGroup('seo')
      .then((data) => setForm({ ...DEFAULTS, ...data } as unknown as SeoSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SeoSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings('seo', form as unknown as Record<string, string>);
      setMessage('SEO settings saved successfully.');
    } catch {
      setMessage('Failed to save SEO settings.');
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
            <label className="block text-sm font-medium text-gray-700">
              Meta Title (English)
            </label>
            <input
              type="text"
              maxLength={70}
              value={form.metaTitleEn}
              onChange={(e) => handleChange('metaTitleEn', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.metaTitleEn.length}/70 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              মেটা টাইটেল (বাংলা)
            </label>
            <input
              type="text"
              maxLength={70}
              value={form.metaTitleBn}
              onChange={(e) => handleChange('metaTitleBn', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.metaTitleBn.length}/70 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meta Description (English)
            </label>
            <textarea
              maxLength={160}
              rows={3}
              value={form.metaDescriptionEn}
              onChange={(e) => handleChange('metaDescriptionEn', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.metaDescriptionEn.length}/160 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              মেটা বিবরণ (বাংলা)
            </label>
            <textarea
              maxLength={160}
              rows={3}
              value={form.metaDescriptionBn}
              onChange={(e) => handleChange('metaDescriptionBn', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              {form.metaDescriptionBn.length}/160 characters
            </p>
          </div>
        </div>
      </section>

      {/* OG Image */}
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Open Graph Image</h3>
        <input
          type="url"
          value={form.ogImage}
          onChange={(e) => handleChange('ogImage', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com/og-image.jpg"
        />
        <p className="text-xs text-gray-400">Recommended: 1200 x 630 pixels</p>
      </section>

      {/* Analytics */}
      <section className="space-y-4">
        <h3 className="font-medium text-gray-800">Analytics & Tracking</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={form.googleAnalyticsId}
              onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              value={form.fbPixelId}
              onChange={(e) => handleChange('fbPixelId', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          value={form.robotsTxt}
          onChange={(e) => handleChange('robotsTxt', e.target.value)}
          className="block w-full font-mono text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </section>

      {/* Canonical URL */}
      <section className="space-y-3">
        <h3 className="font-medium text-gray-800">Canonical URL</h3>
        <input
          type="url"
          value={form.canonicalUrl}
          onChange={(e) => handleChange('canonicalUrl', e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://www.example.com"
        />
      </section>

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </form>
  );
}
