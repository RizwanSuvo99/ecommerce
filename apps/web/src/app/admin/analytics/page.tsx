'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Eye,
  Search,
  ShoppingBag,
  TrendingUp,
  Heart,
  ShoppingCart,
} from 'lucide-react';

import {
  fetchAnalyticsOverview,
  formatBDT,
  type AnalyticsOverview,
  type MostOrderedProduct,
  type MostCartedProduct,
  type MostWishlistedProduct,
} from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import { DateRangePicker, type DateRange } from '@/components/admin/analytics/date-range-picker';
import { ConversionFunnel } from '@/components/admin/analytics/conversion-funnel';
import { MostViewedChart } from '@/components/admin/analytics/most-viewed-chart';
import { MostSearchedChart } from '@/components/admin/analytics/most-searched-chart';

// ──────────────────────────────────────────────────────────
// KPI Card
// ──────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
}

function KpiCard({ title, value, icon, iconBg }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            iconBg,
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Product Rank Table
// ──────────────────────────────────────────────────────────

interface RankTableProps<T> {
  title: string;
  subtitle: string;
  data: T[];
  columns: {
    label: string;
    render: (item: T) => React.ReactNode;
    className?: string;
  }[];
  emptyMessage: string;
}

function RankTable<T>({ title, subtitle, data, columns, emptyMessage }: RankTableProps<T>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-4 text-left font-medium text-gray-500">#</th>
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className={cn('pb-3 pr-4 text-left font-medium text-gray-500', col.className)}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-400">{index + 1}</td>
                  {columns.map((col) => (
                    <td key={col.label} className={cn('py-3 pr-4', col.className)}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Analytics Page
// ──────────────────────────────────────────────────────────

function getDefaultDateRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchAnalyticsOverview({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10,
      });
      setData(result);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Loading State ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
            <p className="text-sm text-gray-500">Track product performance and customer behavior</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
          <p className="text-sm text-gray-500">Track product performance and customer behavior</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error ?? 'Something went wrong'}</p>
          <button
            onClick={loadData}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Content ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
          <p className="text-sm text-gray-500">
            Track product performance and customer behavior — values in BDT (৳)
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Views"
          value={data.funnel.totalViews.toLocaleString()}
          icon={<Eye className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-100"
        />
        <KpiCard
          title="Total Searches"
          value={data.mostSearched.reduce((sum, t) => sum + t.searchCount, 0).toLocaleString()}
          icon={<Search className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <KpiCard
          title="Total Orders"
          value={data.funnel.totalOrders.toLocaleString()}
          icon={<ShoppingBag className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${data.funnel.overallConversionRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-teal-600" />}
          iconBg="bg-teal-100"
        />
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnel data={data.funnel} />

      {/* Charts Row: Most Viewed + Most Searched */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MostViewedChart data={data.mostViewed} />
        <MostSearchedChart data={data.mostSearched} />
      </div>

      {/* Tables Row: Most Ordered + Most Carted */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankTable<MostOrderedProduct>
          title="Most Ordered Products"
          subtitle="Best sellers by quantity"
          data={data.mostOrdered}
          emptyMessage="No order data available yet."
          columns={[
            {
              label: 'Product',
              render: (item) => (
                <span className="font-medium text-gray-900">{item.name}</span>
              ),
            },
            {
              label: 'Units Sold',
              render: (item) => (
                <span className="text-gray-700">{item.totalQuantity.toLocaleString()}</span>
              ),
              className: 'text-right',
            },
            {
              label: 'Revenue',
              render: (item) => (
                <span className="font-medium text-green-600">{formatBDT(item.totalRevenue)}</span>
              ),
              className: 'text-right',
            },
          ]}
        />

        <RankTable<MostCartedProduct>
          title="Most Added to Cart"
          subtitle="Products customers add to cart most"
          data={data.mostCarted}
          emptyMessage="No cart data available yet."
          columns={[
            {
              label: 'Product',
              render: (item) => (
                <span className="font-medium text-gray-900">{item.name}</span>
              ),
            },
            {
              label: 'Cart Adds',
              render: (item) => (
                <div className="flex items-center justify-end gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-700">{item.cartAddCount.toLocaleString()}</span>
                </div>
              ),
              className: 'text-right',
            },
          ]}
        />
      </div>

      {/* Most Wishlisted */}
      <RankTable<MostWishlistedProduct>
        title="Most Wishlisted Products"
        subtitle="Products customers save to their wishlists"
        data={data.mostWishlisted}
        emptyMessage="No wishlist data available yet."
        columns={[
          {
            label: 'Product',
            render: (item) => (
              <span className="font-medium text-gray-900">{item.name}</span>
            ),
          },
          {
            label: 'Wishlist Adds',
            render: (item) => (
              <div className="flex items-center justify-end gap-1.5">
                <Heart className="h-3.5 w-3.5 text-red-400" />
                <span className="text-gray-700">{item.wishlistCount.toLocaleString()}</span>
              </div>
            ),
            className: 'text-right',
          },
        ]}
      />
    </div>
  );
}
