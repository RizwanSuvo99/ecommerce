'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface TaxSettings {
  enable_tax: string;
  vat_percentage: string;
  vat_included_in_price: string;
  vat_registration_number: string;
  show_tax_breakdown: string;
  tax_label: string;
}

const DEFAULTS: TaxSettings = {
  enable_tax: 'true',
  vat_percentage: '15',
  vat_included_in_price: 'true',
  vat_registration_number: '',
  show_tax_breakdown: 'true',
  tax_label: 'VAT',
};

export default function TaxSettingsPage() {
  const [form, setForm] = useState<TaxSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsByGroup('tax')
      .then((data) => setForm({ ...DEFAULTS, ...data } as TaxSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof TaxSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('tax', form as unknown as Record<string, string>);
      toast.success('Tax settings saved');
    } catch {
      toast.error('Failed to save tax settings');
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
            checked={form.enable_tax === 'true'}
            onChange={(e) => handleChange('enable_tax', String(e.target.checked))}
            className="rounded border-gray-300 text-teal-600"
          />
          <span className="text-sm font-medium text-gray-700">Enable Tax Collection</span>
        </label>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.vat_percentage}
                onChange={(e) => handleChange('vat_percentage', e.target.value)}
                className="block w-24 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Standard Bangladesh VAT: 15%</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Label</label>
            <input
              type="text"
              value={form.tax_label}
              onChange={(e) => handleChange('tax_label', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="VAT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              BIN (Business Identification Number)
            </label>
            <input
              type="text"
              value={form.vat_registration_number}
              onChange={(e) => handleChange('vat_registration_number', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
              placeholder="Enter your BIN number"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.vat_included_in_price === 'true'}
            onChange={(e) => handleChange('vat_included_in_price', String(e.target.checked))}
            className="rounded border-gray-300 text-teal-600"
          />
          <span className="text-sm text-gray-700">Product prices include tax</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.show_tax_breakdown === 'true'}
            onChange={(e) => handleChange('show_tax_breakdown', String(e.target.checked))}
            className="rounded border-gray-300 text-teal-600"
          />
          <span className="text-sm text-gray-700">
            Show tax breakdown on invoices and checkout
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Tax Settings'}
        </button>
      </div>
    </form>
  );
}
