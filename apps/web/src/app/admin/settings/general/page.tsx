'use client';

import { useEffect, useState } from 'react';

import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface GeneralSettings {
  siteNameEn: string;
  siteNameBn: string;
  logoUrl: string;
  faviconUrl: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

const DEFAULTS: GeneralSettings = {
  siteNameEn: '',
  siteNameBn: '',
  logoUrl: '',
  faviconUrl: '',
  currency: 'BDT',
  currencySymbol: '৳',
  locale: 'bn-BD',
  timezone: 'Asia/Dhaka',
  contactEmail: '',
  contactPhone: '',
  address: '',
};

export default function GeneralSettingsPage() {
  const [form, setForm] = useState<GeneralSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettingsByGroup('general')
      .then((data) => setForm({ ...DEFAULTS, ...data } as unknown as GeneralSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof GeneralSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateSettings('general', form as unknown as Record<string, string>);
      setMessage('General settings saved successfully.');
    } catch {
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Site Name (English)
          </label>
          <input
            type="text"
            value={form.siteNameEn}
            onChange={(e) => handleChange('siteNameEn', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="My E-Commerce Store"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            সাইটের নাম (বাংলা)
          </label>
          <input
            type="text"
            value={form.siteNameBn}
            onChange={(e) => handleChange('siteNameBn', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="আমার ই-কমার্স স্টোর"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
          <input
            type="url"
            value={form.faviconUrl}
            onChange={(e) => handleChange('faviconUrl', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <div className="mt-1 flex items-center gap-3">
            <select
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="BDT">BDT - Bangladeshi Taka</option>
              <option value="USD">USD - US Dollar</option>
            </select>
            <span className="text-lg font-semibold text-gray-600">
              {form.currencySymbol}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Asia/Dhaka">Asia/Dhaka (BST +06:00)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Phone
          </label>
          <input
            type="tel"
            value={form.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="+880 1XXX-XXXXXX"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save General Settings'}
        </button>
      </div>
    </form>
  );
}
