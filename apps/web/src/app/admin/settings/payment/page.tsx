'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface PaymentSettings {
  enableStripe: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  enableCOD: string;
  codExtraCharge: string;
  bdtToUsdRate: string;
  enableBkash: string;
  enableNagad: string;
}

const DEFAULTS: PaymentSettings = {
  enableStripe: 'false',
  stripePublicKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  enableCOD: 'true',
  codExtraCharge: '0',
  bdtToUsdRate: '110',
  enableBkash: 'false',
  enableNagad: 'false',
};

export default function PaymentSettingsPage() {
  const [form, setForm] = useState<PaymentSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsByGroup('payment')
      .then((data) => setForm({ ...DEFAULTS, ...data } as unknown as PaymentSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof PaymentSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('payment', form as unknown as Record<string, string>);
      toast.success('Payment settings saved');
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading payment settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>

      {/* Cash on Delivery */}
      <section className="space-y-4 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Cash on Delivery (COD)</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableCOD === 'true'}
              onChange={(e) => handleChange('enableCOD', String(e.target.checked))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-600">Enabled</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Extra charge: ৳</label>
          <input
            type="number"
            value={form.codExtraCharge}
            onChange={(e) => handleChange('codExtraCharge', e.target.value)}
            className="w-24 rounded-md border-gray-300 text-sm shadow-sm"
          />
        </div>
      </section>

      {/* Stripe */}
      <section className="space-y-4 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Stripe</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableStripe === 'true'}
              onChange={(e) => handleChange('enableStripe', String(e.target.checked))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-600">Enabled</span>
          </label>
        </div>

        {form.enableStripe === 'true' && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Publishable Key
              </label>
              <input
                type="text"
                value={form.stripePublicKey}
                onChange={(e) => handleChange('stripePublicKey', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="pk_live_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secret Key
              </label>
              <input
                type="password"
                value={form.stripeSecretKey}
                onChange={(e) => handleChange('stripeSecretKey', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="sk_live_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Webhook Secret
              </label>
              <input
                type="password"
                value={form.stripeWebhookSecret}
                onChange={(e) => handleChange('stripeWebhookSecret', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="whsec_..."
              />
            </div>
          </div>
        )}
      </section>

      {/* BDT → USD Conversion */}
      <section className="space-y-3 rounded-md border p-4">
        <h3 className="font-medium text-gray-800">Currency Conversion</h3>
        <p className="text-sm text-gray-500">
          Stripe processes payments in USD. Set the BDT → USD exchange rate.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">1 USD =</span>
          <input
            type="number"
            value={form.bdtToUsdRate}
            onChange={(e) => handleChange('bdtToUsdRate', e.target.value)}
            className="w-28 rounded-md border-gray-300 text-sm shadow-sm"
            step="0.01"
          />
          <span className="text-sm text-gray-600">৳ BDT</span>
        </div>
      </section>

      {/* Mobile Banking */}
      <section className="space-y-4 rounded-md border p-4">
        <h3 className="font-medium text-gray-800">Mobile Banking</h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableBkash === 'true'}
              onChange={(e) => handleChange('enableBkash', String(e.target.checked))}
              className="rounded border-gray-300 text-pink-600"
            />
            <span className="text-sm text-gray-700">bKash</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enableNagad === 'true'}
              onChange={(e) => handleChange('enableNagad', String(e.target.checked))}
              className="rounded border-gray-300 text-orange-600"
            />
            <span className="text-sm text-gray-700">Nagad</span>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>
    </form>
  );
}
