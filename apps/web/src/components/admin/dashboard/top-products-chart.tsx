'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import {
  fetchDashboardCharts,
  formatBDT,
  type TopProduct,
} from '@/lib/api/admin';

// ──────────────────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────────────────

const BAR_COLORS = [
  '#4f46e5',
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#4338ca',
  '#0d9488',
];

// ──────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TopProduct;
    value: number;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const product = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-900">{product.name}</p>
      <p className="text-sm text-gray-600">
        Sold: <span className="font-medium">{product.totalSold} units</span>
      </p>
      <p className="text-sm text-gray-600">
        Revenue: <span className="font-medium">{formatBDT(product.revenue)}</span>
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Top Products Chart
// ──────────────────────────────────────────────────────────

/**
 * Horizontal bar chart showing top-selling products by quantity.
 * Revenue values displayed in BDT (৳).
 */
export function TopProductsChart() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboardCharts();
        setProducts(data.topProducts);
      } catch (err) {
        console.error('Failed to load top products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <p className="mt-4 text-center text-sm text-gray-500">
          No sales data available yet.
        </p>
      </div>
    );
  }

  // Truncate product names for chart display
  const chartData = products.map((p) => ({
    ...p,
    shortName: p.name.length > 20 ? `${p.name.slice(0, 20)}...` : p.name,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <p className="text-sm text-gray-500">Best sellers in the last 30 days</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="shortName"
            type="category"
            width={140}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalSold" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
