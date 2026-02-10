'use client';

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

import type { MostSearchedTerm } from '@/lib/api/admin';

// ──────────────────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────────────────

const BAR_COLORS = [
  '#7c3aed', '#4f46e5', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#db2777', '#4338ca', '#0d9488',
];

// ──────────────────────────────────────────────────────────
// Custom Tooltip
// ──────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: MostSearchedTerm;
    value: number;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-medium text-gray-900">"{item.term}"</p>
      <p className="text-sm text-gray-600">
        Searches: <span className="font-medium">{item.searchCount.toLocaleString()}</span>
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Chart Component
// ──────────────────────────────────────────────────────────

interface MostSearchedChartProps {
  data: MostSearchedTerm[];
}

export function MostSearchedChart({ data }: MostSearchedChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Most Searched Terms</h3>
        <p className="mt-4 text-center text-sm text-gray-500">
          No search data available yet.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortTerm: d.term.length > 20 ? `${d.term.slice(0, 20)}...` : d.term,
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Most Searched Terms</h3>
        <p className="text-sm text-gray-500">What customers are looking for</p>
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
            dataKey="shortTerm"
            type="category"
            width={140}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="searchCount" radius={[0, 4, 4, 0]} barSize={24}>
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
