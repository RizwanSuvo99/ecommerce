'use client';

import { ArrowDown } from 'lucide-react';

import type { ConversionFunnel as ConversionFunnelData } from '@/lib/api/admin';

// ──────────────────────────────────────────────────────────
// Conversion Funnel
// ──────────────────────────────────────────────────────────

interface ConversionFunnelProps {
  data: ConversionFunnelData;
}

interface FunnelStepProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
  bgColor: string;
  maxWidth: string;
}

function FunnelStep({ label, value, percentage, color, bgColor, maxWidth }: FunnelStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-lg px-6 py-4 transition-all"
        style={{ width: maxWidth, backgroundColor: bgColor }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color }}>
            {value.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
      </div>
      <span className="mt-1 text-xs font-medium text-gray-400">{percentage}%</span>
    </div>
  );
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
        <p className="text-sm text-gray-500">
          Product views to orders conversion
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Views */}
        <FunnelStep
          label="Product Views"
          value={data.totalViews}
          percentage={100}
          color="#4f46e5"
          bgColor="#eef2ff"
          maxWidth="100%"
        />

        {/* Arrow with rate */}
        <div className="flex items-center gap-2 py-1">
          <ArrowDown className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-teal-600">
            {data.viewToCartRate}% add to cart
          </span>
          <ArrowDown className="h-4 w-4 text-gray-400" />
        </div>

        {/* Cart Adds */}
        <FunnelStep
          label="Added to Cart"
          value={data.totalCartAdds}
          percentage={data.viewToCartRate}
          color="#0891b2"
          bgColor="#ecfeff"
          maxWidth="70%"
        />

        {/* Arrow with rate */}
        <div className="flex items-center gap-2 py-1">
          <ArrowDown className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-teal-600">
            {data.cartToOrderRate}% purchase
          </span>
          <ArrowDown className="h-4 w-4 text-gray-400" />
        </div>

        {/* Orders */}
        <FunnelStep
          label="Orders Placed"
          value={data.totalOrders}
          percentage={data.overallConversionRate}
          color="#059669"
          bgColor="#ecfdf5"
          maxWidth="45%"
        />
      </div>

      {/* Summary row */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">View to Cart</p>
          <p className="text-lg font-bold text-cyan-600">{data.viewToCartRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Cart to Order</p>
          <p className="text-lg font-bold text-teal-600">{data.cartToOrderRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Overall</p>
          <p className="text-lg font-bold text-green-600">{data.overallConversionRate}%</p>
        </div>
      </div>
    </div>
  );
}
