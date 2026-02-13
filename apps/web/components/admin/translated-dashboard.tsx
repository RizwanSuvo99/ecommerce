'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { formatPrice, formatNumber, type Locale } from '@/lib/format';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

const MOCK_STATS: DashboardStats = {
  totalRevenue: 2450000,
  totalOrders: 1847,
  totalCustomers: 5230,
  totalProducts: 342,
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
};

export function TranslatedDashboard() {
  const t = useTranslations('admin.dashboard');
  const locale = useLocale() as Locale;
  const stats = MOCK_STATS;

  const cards = [
    { key: 'totalRevenue', value: formatPrice(stats.totalRevenue, locale), growth: stats.revenueGrowth },
    { key: 'totalOrders', value: formatNumber(stats.totalOrders, locale), growth: stats.orderGrowth },
    { key: 'totalCustomers', value: formatNumber(stats.totalCustomers, locale), growth: 5.2 },
    { key: 'totalProducts', value: formatNumber(stats.totalProducts, locale), growth: 2.1 },
  ] as const;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('title')}</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{t(card.key)}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-xs text-green-600">
              +{card.growth}% {t('growth', { percent: card.growth.toString() })}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">{t('salesChart')}</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            [Sales Chart Placeholder]
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">{t('recentOrders')}</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            [Recent Orders Table]
          </div>
        </div>
      </div>
    </div>
  );
}
