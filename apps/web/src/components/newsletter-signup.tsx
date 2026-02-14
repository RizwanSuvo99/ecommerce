'use client';

import { useState, FormEvent } from 'react';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer';
  className?: string;
}

export function NewsletterSignup({
  variant = 'card',
  className = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  };

  if (variant === 'inline') {
    return (
      <form
        onSubmit={handleSubmit}
        className={`flex gap-2 ${className}`}
        aria-label="Newsletter subscription"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading'
            ? 'Subscribing...'
            : status === 'success'
              ? 'Subscribed!'
              : 'Subscribe'}
        </button>
      </form>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-white mb-1">
          Subscribe to our newsletter
        </h3>
        <p className="text-sm text-gray-400 mb-1 font-bengali">
          আমাদের নিউজলেটারে সাবস্ক্রাইব করুন
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Get the latest deals and new arrivals delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">
              Thank you for subscribing! / সাবস্ক্রাইব করার জন্য ধন্যবাদ!
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && errorMessage && (
          <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white ${className}`}
    >
      <div className="max-w-xl mx-auto text-center">
        <div className="mb-4">
          <svg
            className="h-12 w-12 mx-auto opacity-90"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2">Stay in the Loop</h2>
        <p className="text-blue-100 mb-1 font-bengali">
          সর্বশেষ আপডেট পেতে সাবস্ক্রাইব করুন
        </p>
        <p className="text-blue-100 mb-6">
          Subscribe for exclusive deals, new arrivals, and special offers
          delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-white/10 rounded-xl p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold">
                You&apos;re subscribed!
              </span>
            </div>
            <p className="text-sm text-blue-100">
              Thank you! Check your inbox for a confirmation email.
            </p>
            <p className="text-sm text-blue-200 font-bengali mt-1">
              ধন্যবাদ! নিশ্চিতকরণ ইমেইল পরীক্ষা করুন।
            </p>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors shadow-lg"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            {status === 'error' && errorMessage && (
              <p className="mt-3 text-sm text-red-200">{errorMessage}</p>
            )}

            <p className="mt-4 text-xs text-blue-200">
              No spam, unsubscribe anytime. By subscribing you agree to our
              Privacy Policy.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
