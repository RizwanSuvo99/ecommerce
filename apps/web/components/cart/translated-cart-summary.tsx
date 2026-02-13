'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatPrice, type Locale } from '@/lib/format';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
}

export function TranslatedCartSummary({ subtotal, shipping, discount, total }: CartSummaryProps) {
  const t = useTranslations('cart');
  const locale = useLocale() as Locale;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">{t('title')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('subtotal')}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('shipping')}</span>
          <span>{shipping > 0 ? formatPrice(shipping, locale) : t('freeShipping')}</span>
        </div>
        {discount && discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{t('discount')}</span>
            <span>-{formatPrice(discount, locale)}</span>
          </div>
        )}
        <hr />
        <div className="flex justify-between text-lg font-bold">
          <span>{t('total')}</span>
          <span className="text-teal-700">{formatPrice(total, locale)}</span>
        </div>
      </div>
      <button className="mt-4 w-full rounded-lg bg-teal-600 py-3 text-white hover:bg-teal-700">
        {t('checkout')}
      </button>
      <p className="mt-2 text-center text-xs text-gray-500">{t('freeShipping')}</p>
    </div>
  );
}
