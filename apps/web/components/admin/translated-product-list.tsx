'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatPrice, type Locale } from '@/lib/format';

export function TranslatedProductList() {
  const t = useTranslations('admin.products');
  const locale = useLocale() as Locale;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            {t('exportCsv')}
          </button>
          <button className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700">
            {t('addProduct')}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t('productName')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t('sku')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t('price')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t('stock')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">Premium Cotton Panjabi</td>
              <td className="px-4 py-3 text-sm text-gray-500">PNJ-001</td>
              <td className="px-4 py-3 text-sm font-medium">{formatPrice(2500, locale)}</td>
              <td className="px-4 py-3 text-sm">45</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{t('active')}</span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">Jamdani Saree - Royal Blue</td>
              <td className="px-4 py-3 text-sm text-gray-500">SAR-042</td>
              <td className="px-4 py-3 text-sm font-medium">{formatPrice(8500, locale)}</td>
              <td className="px-4 py-3 text-sm">12</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{t('active')}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
