'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api/client';

type ReturnStatus = 'RETURNED' | 'CANCELLED' | 'REFUNDED';

interface ReturnOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: number;
  totalAmount: number;
  status: ReturnStatus;
  paymentStatus: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_BADGES: Record<ReturnStatus, { label: string; className: string }> = {
  RETURNED: { label: 'Returned', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
  REFUNDED: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const PAYMENT_BADGES: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' },
  REFUNDED: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  PARTIALLY_REFUNDED: { label: 'Partial Refund', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

export default function AdminReturnsPage() {
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch returned, cancelled, and refunded orders using existing admin orders endpoint
      const statuses: ReturnStatus[] = statusFilter
        ? [statusFilter]
        : ['RETURNED', 'CANCELLED', 'REFUNDED'];

      const allOrders: ReturnOrder[] = [];
      let totalCount = 0;

      // If filtering by single status, use one call; otherwise fetch all three
      if (statusFilter) {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          status: statusFilter,
        });
        const { data } = await apiClient.get(`/admin/orders?${params.toString()}`);
        const result = data.data ?? data;
        const rawOrders = result.orders ?? result.data ?? (Array.isArray(result) ? result : []);
        allOrders.push(...rawOrders.map(mapOrder));
        totalCount = result.total ?? result.meta?.total ?? 0;
      } else {
        // Fetch all return-type statuses in parallel
        const results = await Promise.all(
          statuses.map((s) =>
            apiClient.get(`/admin/orders?page=1&limit=100&status=${s}`).then(({ data }) => {
              const result = data.data ?? data;
              return (result.orders ?? result.data ?? (Array.isArray(result) ? result : [])).map(mapOrder);
            }).catch(() => [] as ReturnOrder[]),
          ),
        );
        for (const batch of results) {
          allOrders.push(...batch);
        }
        // Sort by most recent first
        allOrders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        totalCount = allOrders.length;
      }

      // Client-side search filter
      const filtered = search
        ? allOrders.filter(
            (o) =>
              o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
              o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
              o.customer.email.toLowerCase().includes(search.toLowerCase()),
          )
        : allOrders;

      setOrders(filtered);
      setPagination((prev) => ({
        ...prev,
        total: search ? filtered.length : totalCount,
        totalPages: Math.ceil((search ? filtered.length : totalCount) / prev.limit),
      }));
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, search]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  function mapOrder(o: any): ReturnOrder {
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer ?? {
        name: o.user ? `${o.user.firstName ?? ''} ${o.user.lastName ?? ''}`.trim() : 'Unknown',
        email: o.user?.email ?? '',
        phone: o.user?.phone ?? '',
      },
      items: typeof o.items === 'number' ? o.items : (o._count?.items ?? o.items?.length ?? 0),
      totalAmount: o.totalAmount ?? 0,
      status: o.status,
      paymentStatus: o.paymentStatus ?? 'PENDING',
      paymentMethod: o.paymentMethod ?? '',
      notes: o.notes || o.cancellationReason || null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }

  const counts = {
    all: orders.length,
    RETURNED: orders.filter((o) => o.status === 'RETURNED').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    REFUNDED: orders.filter((o) => o.status === 'REFUNDED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns & Cancellations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage returned, cancelled, and refunded orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total"
          count={counts.all}
          className="border-gray-200"
          active={statusFilter === ''}
          onClick={() => setStatusFilter('')}
        />
        <SummaryCard
          label="Returned"
          count={counts.RETURNED}
          className="border-orange-200"
          active={statusFilter === 'RETURNED'}
          onClick={() => setStatusFilter('RETURNED')}
        />
        <SummaryCard
          label="Cancelled"
          count={counts.CANCELLED}
          className="border-red-200"
          active={statusFilter === 'CANCELLED'}
          onClick={() => setStatusFilter('CANCELLED')}
        />
        <SummaryCard
          label="Refunded"
          count={counts.REFUNDED}
          className="border-purple-200"
          active={statusFilter === 'REFUNDED'}
          onClick={() => setStatusFilter('REFUNDED')}
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason / Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      <span className="ml-3 text-gray-500">Loading returns...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No returns or cancellations found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusBadge = STATUS_BADGES[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
                  const paymentBadge = PAYMENT_BADGES[order.paymentStatus] ?? { label: order.paymentStatus, className: 'bg-gray-100 text-gray-800 border-gray-200' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <a href={`/admin/orders/${order.id}`} className="text-sm font-medium text-teal-600 hover:text-teal-800">
                          #{order.orderNumber}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.items} item{order.items !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatBDT(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={statusBadge.label} className={statusBadge.className} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={paymentBadge.label} className={paymentBadge.className} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 max-w-[200px] truncate" title={order.notes ?? ''}>
                          {order.notes || <span className="text-gray-400 italic">No notes</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.updatedAt).toLocaleDateString('en-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a href={`/admin/orders/${order.id}`} className="text-sm text-teal-600 hover:text-teal-800 font-medium">
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  count,
  className,
  active,
  onClick,
}: {
  label: string;
  count: number;
  className: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition-all ${className} ${
        active ? 'ring-2 ring-teal-500 bg-teal-50' : 'bg-white hover:shadow-sm'
      }`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
    </button>
  );
}
