'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, ShoppingCart, MessageCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. Don&apos;t worry — no charges were
          made to your account.
        </p>

        {/* Order Info */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Order ID:{' '}
              <span className="font-mono font-medium text-gray-900">
                {orderId.slice(0, 8)}...
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your order has been saved. You can complete the payment anytime.
            </p>
          </div>
        )}

        {/* Reasons Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Common reasons for cancellation:
          </h3>
          <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
            <li>Changed your mind about the purchase</li>
            <li>Want to modify your order first</li>
            <li>Payment method issue — try a different card</li>
            <li>Accidental navigation away from checkout</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderId && (
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Checkout
            </Link>
          )}

          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            View Cart
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 w-full text-gray-500 py-2 px-4 rounded-lg hover:text-gray-700 transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
