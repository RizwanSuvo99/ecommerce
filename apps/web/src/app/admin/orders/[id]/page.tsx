'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  sku: string;
  image: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
  };
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
  };
  billingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  totalAmount: number;
  shippingMethod: string;
  trackingNumber: string | null;
  notes: string | null;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'blue' },
  processing: { label: 'Processing', color: 'indigo' },
  shipped: { label: 'Shipped', color: 'purple' },
  delivered: { label: 'Delivered', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
  returned: { label: 'Returned', color: 'gray' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'yellow' },
  paid: { label: 'Paid', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
  refunded: { label: 'Refunded', color: 'orange' },
  partially_refunded: { label: 'Partially Refunded', color: 'amber' },
};

function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800 border border-${color}-200`}>
      {label}
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handlePrintInvoice = () => {
    window.open(`/admin/orders/${orderId}/invoice`, '_blank');
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`);
      if (!response.ok) throw new Error('Failed to generate invoice');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order?.orderNumber || orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Invoice download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist.</p>
        <a href="/admin/orders" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800">
          &larr; Back to Orders
        </a>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_CONFIG[order.paymentStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/admin/orders" className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-BD', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatusDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Update Status
          </button>
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Print Invoice
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3">
        <Badge label={statusConfig.label} color={statusConfig.color} />
        <Badge label={paymentConfig.label} color={paymentConfig.color} />
        {order.trackingNumber && (
          <span className="text-sm text-gray-600">
            Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                    <p className="text-xs text-gray-500">{item.productNameBn}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      SKU: {item.sku} {item.variant && `| ${item.variant}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{formatBDT(item.unitPrice)} × {item.quantity}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatBDT(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatBDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping ({order.shippingMethod})</span>
                <span className="text-gray-900">{formatBDT(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatBDT(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount {order.couponCode && <span className="text-xs text-green-600">({order.couponCode})</span>}
                  </span>
                  <span className="text-green-600">-{formatBDT(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatBDT(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.timeline.map((event, index) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {index !== order.timeline.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white">
                              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900">{event.status}</div>
                            <p className="text-sm text-gray-500">{event.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(event.createdAt).toLocaleString('en-BD')} by {event.createdBy}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.email}</p>
                <p className="text-sm text-gray-500">{order.customer.phone}</p>
              </div>
              <div className="text-xs text-gray-400">
                {order.customer.totalOrders} total orders
              </div>
              <a
                href={`/admin/customers/${order.customer.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                View Customer Profile &rarr;
              </a>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-sm text-gray-600 mt-2">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.area}, {order.shippingAddress.city}<br />
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">{order.billingAddress.name}</p>
              <p className="text-sm text-gray-600">{order.billingAddress.phone}</p>
              <p className="text-sm text-gray-600 mt-2">
                {order.billingAddress.address}<br />
                {order.billingAddress.area}, {order.billingAddress.city}<br />
                {order.billingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge label={paymentConfig.label} color={paymentConfig.color} />
              </div>
              {order.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="text-gray-900 font-mono text-xs">{order.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total Paid</span>
                <span className="text-gray-900">{formatBDT(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
