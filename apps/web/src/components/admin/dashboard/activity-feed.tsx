'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  UserPlus,
  AlertTriangle,
  Package,
  Clock,
} from 'lucide-react';

import {
  fetchDashboardActivity,
  formatBDT,
  type ActivityData,
} from '@/lib/api/admin';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Activity Item Types
// ──────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: 'order' | 'registration' | 'low_stock';
  title: string;
  description: string;
  time: Date;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mergeAndSortActivities(data: ActivityData): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Add recent orders
  for (const order of data.recentOrders) {
    items.push({
      id: `order-${order.id}`,
      type: 'order',
      title: `New order #${order.orderNumber}`,
      description: `${order.customerName} placed an order for ${formatBDT(order.totalAmount)}`,
      time: new Date(order.createdAt),
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    });
  }

  // Add recent registrations
  for (const reg of data.recentRegistrations) {
    items.push({
      id: `reg-${reg.id}`,
      type: 'registration',
      title: 'New customer registered',
      description: `${reg.name} (${reg.email}) created an account`,
      time: new Date(reg.createdAt),
      icon: UserPlus,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    });
  }

  // Add low stock alerts
  for (const alert of data.lowStockAlerts) {
    items.push({
      id: `stock-${alert.id}`,
      type: 'low_stock',
      title: 'Low stock alert',
      description: `${alert.name} (SKU: ${alert.sku}) has only ${alert.stock} units left`,
      time: new Date(), // Current time for alerts
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
    });
  }

  // Sort by time, most recent first
  return items.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 15);
}

// ──────────────────────────────────────────────────────────
// Activity Feed Component
// ──────────────────────────────────────────────────────────

/**
 * Activity feed widget showing a chronological list of recent
 * orders, customer registrations, and low stock alerts.
 */
export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await fetchDashboardActivity();
        setActivities(mergeAndSortActivities(data));
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-36 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 flex gap-3"
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        <p className="text-sm text-gray-500">Recent store activity</p>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto px-6 py-4">
        {activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No recent activity.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    activity.iconBg,
                  )}
                >
                  <activity.icon
                    className={cn('h-4 w-4', activity.iconColor)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(activity.time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
