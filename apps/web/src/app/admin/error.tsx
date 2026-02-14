'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/error-reporting';

interface AdminErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    reportError(error, {
      component: 'AdminErrorBoundary',
      section: 'admin',
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Admin Panel Error
        </h2>
        <p className="text-gray-600 mb-6">
          An error occurred in the admin panel. This has been logged and our
          team will investigate.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-700 break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">
            Reference: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
          <a
            href="/admin"
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Admin Home
          </a>
        </div>
      </div>
    </div>
  );
}
