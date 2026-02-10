'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSettingsByGroup, updateSettings } from '@/lib/api/settings';

interface EmailSettings {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: string;
  from_email: string;
  from_name: string;
  reply_to_email: string;
  order_confirmation: string;
  shipping_notification: string;
  welcome_email: string;
}

const DEFAULTS: EmailSettings = {
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_secure: 'true',
  from_email: '',
  from_name: '',
  reply_to_email: '',
  order_confirmation: 'true',
  shipping_notification: 'true',
  welcome_email: 'true',
};

export default function EmailSettingsPage() {
  const [form, setForm] = useState<EmailSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettingsByGroup('email')
      .then((data) => setForm({ ...DEFAULTS, ...data } as EmailSettings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof EmailSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings('email', form as unknown as Record<string, string>);
      toast.success('Email settings saved');
    } catch {
      toast.error('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading email settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Email / SMTP Settings</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
          <input
            type="text"
            value={form.smtp_host}
            onChange={(e) => handleChange('smtp_host', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
          <input
            type="number"
            value={form.smtp_port}
            onChange={(e) => handleChange('smtp_port', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
          <input
            type="text"
            value={form.smtp_user}
            onChange={(e) => handleChange('smtp_user', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
          <input
            type="password"
            value={form.smtp_pass}
            onChange={(e) => handleChange('smtp_pass', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">From Email</label>
          <input
            type="email"
            value={form.from_email}
            onChange={(e) => handleChange('from_email', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">From Name</label>
          <input
            type="text"
            value={form.from_name}
            onChange={(e) => handleChange('from_name', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reply-To Email</label>
          <input
            type="email"
            value={form.reply_to_email}
            onChange={(e) => handleChange('reply_to_email', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Encryption</label>
          <select
            value={form.smtp_secure}
            onChange={(e) => handleChange('smtp_secure', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="true">TLS</option>
            <option value="false">None</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Email Notifications</legend>
        {[
          { key: 'order_confirmation' as const, label: 'Order Confirmation' },
          { key: 'shipping_notification' as const, label: 'Shipping Notification' },
          { key: 'welcome_email' as const, label: 'Welcome Email' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form[key] === 'true'}
              onChange={(e) => handleChange(key, String(e.target.checked))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </fieldset>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Email Settings'}
        </button>
      </div>
    </form>
  );
}
