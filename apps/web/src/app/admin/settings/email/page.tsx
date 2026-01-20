'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getSettingsByGroup, sendTestEmail, updateSettings } from '@/lib/api/settings';

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  orderConfirmation: string;
  shippingNotification: string;
  welcomeEmail: string;
}

const DEFAULTS: EmailSettings = {
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpSecure: 'true',
  fromEmail: '',
  fromName: '',
  replyToEmail: '',
  orderConfirmation: 'true',
  shippingNotification: 'true',
  welcomeEmail: 'true',
};

export default function EmailSettingsPage() {
  const [form, setForm] = useState<EmailSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    getSettingsByGroup('email')
      .then((data) => setForm({ ...DEFAULTS, ...data } as unknown as EmailSettings))
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

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setSendingTest(true);
    try {
      await sendTestEmail(testEmail);
      toast.success('Test email sent');
    } catch {
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
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
            value={form.smtpHost}
            onChange={(e) => handleChange('smtpHost', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="smtp.gmail.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
          <input
            type="number"
            value={form.smtpPort}
            onChange={(e) => handleChange('smtpPort', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
          <input
            type="text"
            value={form.smtpUser}
            onChange={(e) => handleChange('smtpUser', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
          <input
            type="password"
            value={form.smtpPass}
            onChange={(e) => handleChange('smtpPass', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">From Email</label>
          <input
            type="email"
            value={form.fromEmail}
            onChange={(e) => handleChange('fromEmail', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">From Name</label>
          <input
            type="text"
            value={form.fromName}
            onChange={(e) => handleChange('fromName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">Email Notifications</legend>
        {[
          { key: 'orderConfirmation' as const, label: 'Order Confirmation' },
          { key: 'shippingNotification' as const, label: 'Shipping Notification' },
          { key: 'welcomeEmail' as const, label: 'Welcome Email' },
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

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700">Send Test Email</h3>
        <div className="mt-2 flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={sendingTest || !testEmail}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

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
