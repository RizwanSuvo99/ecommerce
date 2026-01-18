'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingDistrict: string;
  shippingDivision: string;
  shippingPostalCode: string;
  statusNote: string | null;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
}

// ──────────────────────────────────────────────────────────
// Order Status Timeline
// ──────────────────────────────────────────────────────────

/**
 * Order status steps in chronological order.
 */
const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: '📋' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
  { key: 'PROCESSING', label: 'Processing', icon: '⚙' },
  { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered', icon: '📦' },
];

const CANCELLED_STATUS = { key: 'CANCELLED', label: 'Cancelled', icon: '✕' };

/**
 * Determine which statuses have been reached.
 */
function getReachedStatuses(currentStatus: string): string[] {
  if (currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED') {
    return ['CANCELLED'];
  }

  const reached: string[] = [];
  for (const step of STATUS_STEPS) {
    reached.push(step.key);
    if (step.key === currentStatus) break;
  }
  return reached;
}

interface StatusTimelineProps {
  currentStatus: string;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

function StatusTimeline({
  currentStatus,
  createdAt,
  confirmedAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
}: StatusTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';
  const reached = getReachedStatuses(currentStatus);
  const steps = isCancelled ? [...STATUS_STEPS.slice(0, 1), CANCELLED_STATUS] : STATUS_STEPS;

  const getTimestamp = (key: string): string | null => {
    switch (key) {
      case 'PENDING': return createdAt;
      case 'CONFIRMED': return confirmedAt;
      case 'SHIPPED': return shippedAt;
      case 'DELIVERED': return deliveredAt;
      case 'CANCELLED': return cancelledAt;
      default: return null;
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isReached = reached.includes(step.key);
        const isCurrent = step.key === currentStatus;
        const isCancelledStep = step.key === 'CANCELLED';
        const timestamp = getTimestamp(step.key);

        return (
          <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  isCancelledStep
                    ? 'bg-red-100 text-red-600 ring-4 ring-red-50'
                    : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : isReached
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isReached && !isCurrent && !isCancelledStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isCancelledStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-2 ${
                    isReached && !isCurrent ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Step content */}
            <div className="pt-2">
              <p
                className={`font-medium ${
                  isCancelledStep
                    ? 'text-red-600'
                    : isCurrent
                      ? 'text-blue-600'
                      : isReached
                        ? 'text-gray-900'
                        : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'PROCESSING': return 'bg-indigo-100 text-indigo-800';
    case 'SHIPPED': return 'bg-purple-100 text-purple-800';
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    case 'REFUNDED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

// ──────────────────────────────────────────────────────────
// Cancel Order Dialog
// ──────────────────────────────────────────────────────────

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

function CancelDialog({ isOpen, onClose, onConfirm, isSubmitting }: CancelDialogProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cancel Order
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to cancel this order? This action cannot be undone.
        </p>

        <div className="mb-4">
          <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for cancellation <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="cancelReason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            placeholder="Tell us why you want to cancel..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Order Tracking Page
// ──────────────────────────────────────────────────────────

/**
 * Order tracking page.
 *
 * Displays the order status timeline, full order details, item list,
 * shipping information, and cost breakdown. Includes a cancel button
 * for orders in PENDING or CONFIRMED status.
 *
 * Route: /orders/[orderNumber]
 */
export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // TODO: Fetch order from API: GET /orders/:orderNumber
    const fetchOrder = async () => {
      setIsLoading(true);
      // Placeholder — will be connected to the API
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderNumber]);

  const canCancel =
    order && (order.status === 'PENDING' || order.status === 'CONFIRMED');

  const handleCancelOrder = async (reason: string) => {
    if (!order) return;

    setIsCancelling(true);
    try {
      // TODO: POST /orders/:id/cancel
      console.log('Cancelling order:', order.id, reason);
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find order {orderNumber}. Please check the order number and try again.
          </p>
          <Link
            href="/orders"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/orders"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              My Orders
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-900 font-medium font-mono">
              {order.orderNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-BD', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(order.status)}`}
          >
            {order.status}
          </span>

          {/* Cancel button */}
          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelDialog(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Timeline + Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status Timeline */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Order Status
            </h2>
            <StatusTimeline
              currentStatus={order.status}
              createdAt={order.createdAt}
              confirmedAt={order.confirmedAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              cancelledAt={order.cancelledAt}
            />
            {order.statusNote && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <span className="font-medium">Note:</span> {order.statusNote}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Items ({order.items.length})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.imageUrl || '/placeholder-product.png'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      SKU: {item.sku} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.shippingName}</p>
              <p className="mt-1">{order.shippingPhone}</p>
              <p className="mt-1">
                {order.shippingAddress}
                {order.shippingAddress2 && `, ${order.shippingAddress2}`}
              </p>
              <p>
                {order.shippingCity}, {order.shippingDistrict}
              </p>
              <p>
                {order.shippingDivision} {order.shippingPostalCode}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Payment
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.paymentMethod === 'CARD' ? 'Credit/Debit Card' :
                 order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                 order.paymentMethod}
              </p>
              <p className="mt-1">
                Status:{' '}
                <span className="font-medium">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{order.tax > 0 ? formatPrice(order.tax) : 'Included'}</span>
              </div>
              <div className="border-t border-gray-200 my-2" />
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span className="text-lg">{formatPrice(order.total)}</span>
              </div>
              <p className="text-xs text-gray-400 text-right">BDT ৳</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        isSubmitting={isCancelling}
      />
    </div>
  );
}
