'use client';

import { useTranslations } from 'next-intl';

export function TranslatedCheckoutForm() {
  const t = useTranslations('checkout');
  const tv = useTranslations('validation');

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-lg font-semibold">{t('shippingAddress')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('fullName')}</label>
            <input type="text" className="w-full rounded-lg border px-3 py-2" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
            <input type="tel" className="w-full rounded-lg border px-3 py-2" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">{t('address')}</label>
            <textarea className="w-full rounded-lg border px-3 py-2" rows={2} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('district')}</label>
            <select className="w-full rounded-lg border px-3 py-2">
              <option value="">---</option>
              <option value="dhaka">Dhaka</option>
              <option value="chittagong">Chittagong</option>
              <option value="rajshahi">Rajshahi</option>
              <option value="sylhet">Sylhet</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('postalCode')}</label>
            <input type="text" className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t('paymentMethod')}</h2>
        <div className="space-y-2">
          {(['cashOnDelivery', 'bkash', 'nagad', 'card'] as const).map((method) => (
            <label key={method} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value={method} />
              <span className="text-sm font-medium">{t(method)}</span>
            </label>
          ))}
        </div>
      </section>

      <button className="w-full rounded-lg bg-teal-600 py-3 text-white font-semibold hover:bg-teal-700">
        {t('placeOrder')}
      </button>
    </div>
  );
}
