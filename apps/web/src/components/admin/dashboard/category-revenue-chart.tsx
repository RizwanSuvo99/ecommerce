'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import {
  fetchDashboardCharts,
  formatBDT,
  type CategoryRevenue,
} from '@/lib/api/admin';

// ──────────────────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────────────────

const PIE_COLORS = [
  '#4f46e5',
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
];

// ──────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryRevenue;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const category = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-900">
        {category.category}
      </p>
      <p className="text-sm text-gray-600">
        Revenue: <span className="font-medium">{formatBDT(category.revenue)}</span>
      </p>
      <p className="text-sm text-gray-600">
        Share: <span className="font-medium">{category.percentage}%</span>
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Custom Legend
// ──────────────────────────────────────────────────────────

interface LegendPayloadItem {
  value: string;
  color: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload?.length) return null;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Category Revenue Chart
// ──────────────────────────────────────────────────────────

/**
 * Pie/donut chart showing revenue breakdown by category.
 * All values in BDT (৳).
 */
export function CategoryRevenueChart() {
  const [categories, setCategories] = useState<CategoryRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboardCharts();
        setCategories(data.revenueByCategory);
      } catch (err) {
        console.error('Failed to load category revenue:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Revenue by Category
        </h3>
        <p className="mt-4 text-center text-sm text-gray-500">
          No category data available yet.
        </p>
      </div>
    );
  }

  const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Revenue by Category
        </h3>
        <p className="text-sm text-gray-500">
          Total: {formatBDT(totalRevenue)} in the last 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={categories}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="revenue"
            nameKey="category"
          >
            {categories.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
