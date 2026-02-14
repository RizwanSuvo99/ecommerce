/**
 * Client-side error reporting utility
 * 
 * Provides a unified interface for capturing and reporting errors
 * from the browser to external tracking services.
 * 
 * Supports:
 * - Sentry (placeholder - uncomment when DSN is configured)
 * - Console logging (development)
 * - API endpoint reporting (production fallback)
 */

interface ErrorContext {
  component?: string;
  section?: string;
  digest?: string;
  userId?: string;
  [key: string]: unknown;
}

interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  url: string;
  userAgent: string;
  timestamp: string;
  sessionId: string;
}

// Generate a session ID for correlating errors
const sessionId =
  typeof window !== 'undefined'
    ? `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    : 'server';

/**
 * Report an error to the tracking service
 */
export function reportError(error: Error, context: ErrorContext = {}): void {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    sessionId,
  };

  // Development: log to console
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 Error Report');
    console.error('Error:', error);
    console.info('Context:', context);
    console.info('Report:', errorReport);
    console.groupEnd();
    return;
  }

  // Production: send to error tracking service
  sendErrorReport(errorReport);

  // Sentry integration placeholder
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.withScope((scope) => {
  //     Object.entries(context).forEach(([key, value]) => {
  //       scope.setExtra(key, value);
  //     });
  //     scope.setTag('sessionId', sessionId);
  //     window.Sentry.captureException(error);
  //   });
  // }
}

/**
 * Report a custom message/event
 */
export function reportMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context: ErrorContext = {},
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
    return;
  }

  sendErrorReport({
    message,
    context: { ...context, level },
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    sessionId,
  });
}

/**
 * Set user context for error reporting
 */
export function setErrorUser(user: { id: string; email?: string }): void {
  // Sentry: Sentry.setUser(user);
  if (process.env.NODE_ENV === 'development') {
    console.log('[ErrorReporting] User context set:', user);
  }
}

/**
 * Clear user context (on logout)
 */
export function clearErrorUser(): void {
  // Sentry: Sentry.setUser(null);
  if (process.env.NODE_ENV === 'development') {
    console.log('[ErrorReporting] User context cleared');
  }
}

/**
 * Send error report to the API
 */
async function sendErrorReport(report: ErrorReport): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    await fetch(`${apiUrl}/api/errors/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Don't block the UI
      keepalive: true,
    });
  } catch {
    // Silently fail - we don't want error reporting to cause more errors
    console.warn('[ErrorReporting] Failed to send error report');
  }
}

/**
 * Global error handler for unhandled errors
 */
export function initGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    reportError(error, {
      component: 'GlobalHandler',
      type: 'unhandledRejection',
    });
  });

  // Runtime errors
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message);

    reportError(error, {
      component: 'GlobalHandler',
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}
