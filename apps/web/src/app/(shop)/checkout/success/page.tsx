'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// ──────────────────────────────────────────────────────────
// Confetti Animation (CSS-only)
// ──────────────────────────────────────────────────────────

/**
 * CSS-based confetti animation.
 *
 * Creates falling colorful dots using pure CSS keyframes.
 * No external dependencies required.
 */
function Confetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#FFD93D', '#FF8B94', '#6C5CE7'];
  const pieces = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((i) => {
        const color = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 3;
        const size = 6 + Math.random() * 6;

        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}

      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 50;
        }

        .confetti-piece {
          position: absolute;
          top: -10px;
          border-radius: 50%;
          opacity: 0;
          animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Success Page
// ──────────────────────────────────────────────────────────

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [showConfetti, setShowConfetti] = useState(true);

  // Hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Order Placed Successfully!
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            Thank you for your order. We&apos;re getting it ready for you.
          </p>

          {/* Order number */}
          {orderNumber && (
            <div className="mt-6 mb-8 inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-6 py-4">
              <span className="text-sm text-gray-500">Order Number:</span>
              <span className="text-lg font-bold text-gray-900 font-mono">
                {orderNumber}
              </span>
            </div>
          )}

          {/* Order details card */}
          <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6 lg:p-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Confirmation</p>
                  <p className="text-sm text-gray-500">
                    You will receive an email confirmation with your order details shortly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Processing</p>
                  <p className="text-sm text-gray-500">
                    Our team will verify and start preparing your order within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipping</p>
                  <p className="text-sm text-gray-500">
                    Once shipped, you will receive a tracking update via SMS and email.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-500">
                    Your order will be delivered to your specified address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {orderNumber && (
              <Link
                href={`/orders/${orderNumber}`}
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
              >
                Track Your Order
              </Link>
            )}

            <Link
              href="/"
              className="rounded-xl bg-white border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-8 text-xs text-gray-400">
            Have a question about your order?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
