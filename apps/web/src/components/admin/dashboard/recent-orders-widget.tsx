'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  RotateCcw,
} from 'lucide-react';

import {
  fetchDashboardActivity,
  formatBDT,
  type RecentOrder,
} from '@/lib/api/admin';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Status configuration
// ──────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: RotateCcw,
  },
};

// ──────────────────────────────────────────────────────────
// Status Badge
// ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: Clock,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.color,
        config.bgColor,
      )}
    >
      <config.icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// Recent Orders Widget
// ──────────────────────────────────────────────────────────

/**
 * Widget showing the most recent orders with status, customer, and
 * order amount in BDT (৳).
 */
export function RecentOrdersWidget() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchDashboardActivity();
        setOrders(data.recentOrders);
      } catch (err) {
        console.error('Failed to load recent orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="mb-3 h-14 animate-pulse rounded bg-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500">Latest customer orders</p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View All
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-100">
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No orders yet.
          </div>
        ) : (
          orders.slice(0, 7).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    #{order.orderNumber}
                  </Link>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {order.customerName} &middot; {order.itemCount} item
                  {order.itemCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatBDT(order.totalAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
