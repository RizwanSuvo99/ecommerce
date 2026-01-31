'use client';

import Link from 'next/link';
import {
  Plus,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────
// Quick Action Items
// ──────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Add Product',
    description: 'Create a new product listing',
    href: '/admin/products/new',
    icon: Plus,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  {
    label: 'View Orders',
    description: 'Manage pending orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    label: 'Products',
    description: 'Manage your product catalog',
    href: '/admin/products',
    icon: Package,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    label: 'Customers',
    description: 'View customer accounts',
    href: '/admin/customers',
    icon: Users,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    label: 'Coupons',
    description: 'Create discount coupons',
    href: '/admin/coupons',
    icon: Tag,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
  {
    label: 'Reports',
    description: 'View sales reports',
    href: '/admin/reports',
    icon: BarChart3,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
];

// ──────────────────────────────────────────────────────────
// Quick Actions Component
// ──────────────────────────────────────────────────────────

/**
 * Quick actions grid for the admin dashboard.
 * Provides shortcuts to common admin tasks.
 */
export function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
          >
            <div
              className={cn(
                'mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                action.iconBg,
                'group-hover:bg-indigo-100',
              )}
            >
              <action.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  action.iconColor,
                  'group-hover:text-indigo-600',
                )}
              />
            </div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
              {action.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
