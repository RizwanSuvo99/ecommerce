import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/apps/api/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      moduleNameMapper: {
        '@ecommerce/database': '<rootDir>/packages/database/src',
        '@ecommerce/ui': '<rootDir>/packages/ui/src',
        '@ecommerce/ui/(.*)': '<rootDir>/packages/ui/src/$1',
      },
      moduleFileExtensions: ['ts', 'js', 'json'],
      rootDir: '.',
      testEnvironment: 'node',
      setupFilesAfterSetup: ['<rootDir>/apps/api/test/jest-setup.ts'],
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'apps/web/tsconfig.json' }],
      },
      moduleNameMapper: {
        '@ecommerce/ui': '<rootDir>/packages/ui/src',
        '@ecommerce/ui/(.*)': '<rootDir>/packages/ui/src/$1',
        '@ecommerce/database': '<rootDir>/packages/database/src',
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/apps/web/test/__mocks__/fileMock.js',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      rootDir: '.',
      testEnvironment: 'jsdom',
      setupFilesAfterSetup: ['<rootDir>/apps/web/jest.setup.ts'],
    },
    {
      displayName: 'ui',
      testMatch: ['<rootDir>/packages/ui/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'packages/ui/tsconfig.json' }],
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      rootDir: '.',
      testEnvironment: 'jsdom',
    },
  ],
  collectCoverageFrom: [
    'apps/api/src/**/*.ts',
    'apps/web/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    'apps/api/src/auth/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'apps/api/src/orders/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'apps/api/src/payment/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
};

export default config;
