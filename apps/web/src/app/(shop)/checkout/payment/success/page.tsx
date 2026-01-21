'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

import { getPaymentByOrder, formatBDT } from '@/lib/api/payment';
import type { PaymentRecord } from '@/lib/api/payment';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getPaymentByOrder(orderId)
        .then(setPayment)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>

        {/* Payment Details */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-gray-900">
                  {orderId?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatBDT(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="text-gray-900">{payment.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {sessionId && !payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Session ID: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderId && (
            <Link
              href={`/orders/${orderId}/tracking`}
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Package className="w-5 h-5" />
              Track Your Order
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* Confirmation Note */}
        <p className="mt-6 text-xs text-gray-400">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
