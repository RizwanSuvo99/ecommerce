import { rest } from 'msw';
import { setupServer } from 'msw/node';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Mock API handlers
export const handlers = [
  rest.post(`${API_BASE}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'CUSTOMER' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }),
    );
  }),

  rest.post(`${API_BASE}/auth/register`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ message: 'Registration successful' }));
  }),

  rest.get(`${API_BASE}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return res(ctx.status(401));
    return res(
      ctx.json({ id: '1', email: 'test@example.com', name: 'Test User', role: 'CUSTOMER' }),
    );
  }),

  rest.get(`${API_BASE}/products`, (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          { id: '1', name: 'Product 1', slug: 'product-1', price: 1999 },
          { id: '2', name: 'Product 2', slug: 'product-2', price: 2999 },
        ],
        meta: { total: 2, page: 1, limit: 12 },
      }),
    );
  }),

  rest.get(`${API_BASE}/cart`, (req, res, ctx) => {
    return res(ctx.json({ id: 'cart-1', items: [], subtotal: 0, total: 0 }));
  }),

  rest.post(`${API_BASE}/cart/items`, (req, res, ctx) => {
    return res(ctx.json({ id: 'cart-1', items: [], subtotal: 0, total: 0 }));
  }),
];

export const server = setupServer(...handlers);

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  isFallback: false,
  isReady: true,
  isPreview: false,
  basePath: '',
  locale: 'en',
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock auth utilities
export const mockAuthContext = {
  user: null as any,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
};
