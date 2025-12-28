'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ExternalLink,
  Package,
  ImageIcon,
} from 'lucide-react';

import {
  fetchDashboardActivity,
  type LowStockAlert,
} from '@/lib/api/admin';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Stock Level Indicator
// ──────────────────────────────────────────────────────────

function StockIndicator({ stock, threshold }: { stock: number; threshold: number }) {
  const percentage = Math.min((stock / Math.max(threshold, 1)) * 100, 100);

  let barColor = 'bg-red-500';
  if (percentage > 50) barColor = 'bg-yellow-500';
  if (percentage > 80) barColor = 'bg-green-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'text-xs font-medium',
          stock <= 5 ? 'text-red-600' : 'text-yellow-600',
        )}
      >
        {stock} left
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Low Stock Widget
// ──────────────────────────────────────────────────────────

/**
 * Widget showing products that are running low on stock.
 * Helps admins quickly identify items that need restocking.
 */
export function LowStockWidget() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchDashboardActivity();
        setAlerts(data.lowStockAlerts);
      } catch (err) {
        console.error('Failed to load low stock alerts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-3 h-12 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alerts
            </h3>
            <p className="text-sm text-gray-500">
              {alerts.length} product{alerts.length !== 1 ? 's' : ''} need
              restocking
            </p>
          </div>
        </div>
        <Link
          href="/admin/products?filter=low-stock"
          className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          View All
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-100">
        {alerts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Package className="mx-auto h-8 w-8 text-green-400" />
            <p className="mt-2 text-sm text-gray-500">
              All products are well stocked!
            </p>
          </div>
        ) : (
          alerts.slice(0, 8).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50"
            >
              {/* Product Image */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {alert.image ? (
                  <img
                    src={alert.image}
                    alt={alert.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-gray-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${alert.id}/edit`}
                  className="truncate text-sm font-medium text-gray-900 hover:text-teal-600"
                >
                  {alert.name}
                </Link>
                <p className="text-xs text-gray-500">SKU: {alert.sku}</p>
              </div>

              {/* Stock Level */}
              <StockIndicator
                stock={alert.stock}
                threshold={alert.lowStockThreshold}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
