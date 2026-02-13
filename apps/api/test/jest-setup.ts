import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ecommerce_test';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_webhook_secret';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.MAIL_HOST = 'localhost';
process.env.MAIL_PORT = '1025';
process.env.UPLOAD_DIR = '/tmp/ecommerce-test-uploads';

// Global test timeout
jest.setTimeout(30000);

// Suppress console output during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  });

  console.warn = jest.fn((...args) => {
    originalConsoleWarn.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
