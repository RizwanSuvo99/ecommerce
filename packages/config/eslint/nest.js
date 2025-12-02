/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  rules: {
    /* ── NestJS specific ────────────────────────────── */
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-empty-interface': [
      'error',
      { allowSingleExtends: true },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    /* ── NestJS uses constructor injection heavily ──── */
    '@typescript-eslint/no-useless-constructor': 'off',
    'no-useless-constructor': 'off',

    /* ── Allow empty functions for abstract/interface implementations ── */
    '@typescript-eslint/no-empty-function': [
      'error',
      { allow: ['constructors', 'decoratedFunctions'] },
    ],

    /* ── Console in server-side code is acceptable ──── */
    'no-console': 'off',

    /* ── Import rules ───────────────────────────────── */
    'import/no-cycle': 'error',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['**/*.dto.ts', '**/*.entity.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
