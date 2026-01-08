'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  CreditCard,
  MapPin,
  Heart,
  Settings,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api/client';
import { PaymentBadge } from '@/components/payment/payment-badge';

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  totalSpentFormatted: string;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalFormatted: string;
  itemCount: number;
  createdAt: string;
}

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          apiClient.get('/users/orders/stats'),
          apiClient.get('/users/orders?limit=5'),
        ]);

        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading */}
        <div className="bg-white rounded-xl p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Total Spent',
      value: stats?.totalSpentFormatted || '৳0',
      icon: CreditCard,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'In Transit',
      value: stats?.shipped || 0,
      icon: Truck,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Delivered',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const quickActions = [
    { label: 'My Orders', href: '/orders', icon: Package },
    { label: 'Addresses', href: '/addresses', icon: MapPin },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Settings', href: '/profile', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">
          Welcome back, {user?.firstName || 'there'}!
        </h2>
        <p className="text-teal-100 text-sm mt-1">
          Here&apos;s a summary of your account activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Orders
          </h3>
          <Link
            href="/orders"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} •{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-BD')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PaymentBadge status={order.status} size="sm" />
                  <span className="text-sm font-semibold text-gray-900">
                    {order.totalFormatted}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders yet</p>
            <Link
              href="/"
              className="text-teal-600 text-sm font-medium hover:text-teal-700 mt-1 inline-block"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
            >
              <Icon className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
