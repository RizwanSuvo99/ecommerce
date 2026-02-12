'use client';

import { useEffect, useState } from 'react';

import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface TaxSettings {
  enableTax: string;
  vatRate: string;
  priceIncludesTax: string;
  taxRegistrationNumber: string;
  showTaxBreakdown: string;
  taxLabel: string;
}

const DEFAULTS: TaxSettings = {
  enableTax: 'true',
  vatRate: '15',
  priceIncludesTax: 'true',
  taxRegistrationNumber: '',
  showTaxBreakdown: 'true',
  taxLabel: 'VAT',
};

export default function TaxSettingsPage() {
  const [form, setForm] = useState<TaxSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettingsByGroup('tax')
      .then((data) => setForm({ ...DEFAULTS, ...data } as unknown as TaxSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof TaxSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings('tax', form as unknown as Record<string, string>);
      setMessage('Tax settings saved successfully.');
    } catch {
      setMessage('Failed to save tax settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading tax settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Tax Settings</h2>

      <p className="text-sm text-gray-500">
        Bangladesh standard VAT rate is 15%. Configure tax behavior for your store.
      </p>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.enableTax === 'true'}
            onChange={(e) => handleChange('enableTax', String(e.target.checked))}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Enable Tax Collection</span>
        </label>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              VAT Rate (%)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.vatRate}
                onChange={(e) => handleChange('vatRate', e.target.value)}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Standard Bangladesh VAT: 15%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tax Label
            </label>
            <input
              type="text"
              value={form.taxLabel}
              onChange={(e) => handleChange('taxLabel', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="VAT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              BIN (Business Identification Number)
            </label>
            <input
              type="text"
              value={form.taxRegistrationNumber}
              onChange={(e) => handleChange('taxRegistrationNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your BIN number"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.priceIncludesTax === 'true'}
            onChange={(e) => handleChange('priceIncludesTax', String(e.target.checked))}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">Product prices include tax</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.showTaxBreakdown === 'true'}
            onChange={(e) => handleChange('showTaxBreakdown', String(e.target.checked))}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">
            Show tax breakdown on invoices and checkout
          </span>
        </label>
      </div>

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
          {saving ? 'Saving...' : 'Save Tax Settings'}
        </button>
      </div>
    </form>
  );
}
