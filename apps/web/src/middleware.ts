import { NextResponse, type NextRequest } from 'next/server';

// ──────────────────────────────────────────────────────────
// Route configuration
// ──────────────────────────────────────────────────────────

/**
 * Routes that are always accessible without authentication.
 * Includes static assets, API routes, and public pages.
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/products',
  '/categories',
  '/search',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

/**
 * Auth pages — authenticated users should be redirected away from these
 * to prevent confusion (e.g., showing the login form to someone already
 * logged in).
 */
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

/**
 * Routes that require authentication. Everything not in PUBLIC_ROUTES
 * is considered protected, but these prefixes are explicitly protected
 * to make intent clear.
 */
const PROTECTED_PREFIXES = [
  '/account',
];

/**
 * Paths under protected prefixes that guests are allowed to access
 * (e.g. checkout flow and guest order tracking).
 */
const GUEST_ALLOWED_PATHS = [
  '/checkout',
  '/orders/track',
];

/** Cookie name used to store the access token (must match tokens.ts). */
const AUTH_COOKIE_NAME = 'ecom_access_token';

/** Where to send unauthenticated users. */
const LOGIN_PATH = '/login';

/** Where to send authenticated users who visit auth-only pages. */
const DEFAULT_AUTHENTICATED_REDIRECT = '/';

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Allow sub-paths of public routes like /products/[slug]
  return PUBLIC_ROUTES.some(
    (route) => route !== '/' && pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isGuestAllowed(pathname: string): boolean {
  return GUEST_ALLOWED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// ──────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(accessToken);

  // ── Authenticated user visiting auth pages → redirect away ──
  if (isAuthenticated && isAuthRoute(pathname)) {
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    const destination = redirectTo ?? DEFAULT_AUTHENTICATED_REDIRECT;

    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.searchParams.delete('redirect');

    return NextResponse.redirect(url);
  }

  // ── Unauthenticated user visiting protected routes → login ──
  if (!isAuthenticated && isProtectedRoute(pathname) && !isGuestAllowed(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set('redirect', pathname);

    return NextResponse.redirect(url);
  }

  // ── Public route or authenticated + non-auth route → pass through ──
  if (isPublicRoute(pathname) || isAuthenticated) {
    return NextResponse.next();
  }

  // ── Catch-all: unauthenticated users hitting unknown routes ──
  // For routes not explicitly public or protected, allow access
  // (e.g., static pages added later). If you prefer "deny by default",
  // swap this to a redirect.
  return NextResponse.next();
}

// ──────────────────────────────────────────────────────────
// Matcher — skip middleware for static files and internal routes
// ──────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.ico  (browser favicon)
     * - public files (assets in /public)
     * - api routes   (handled by Next.js API routes)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
