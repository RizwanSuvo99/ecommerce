/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    './base.js',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['react', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    /* ── React ──────────────────────────────────────── */
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/self-closing-comp': 'error',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never' },
    ],

    /* ── React Hooks ────────────────────────────────── */
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /* ── Accessibility ──────────────────────────────── */
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],

    /* ── Next.js specific ───────────────────────────── */
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'warn',

    /* ── Override base for Next.js patterns ─────────── */
    '@typescript-eslint/require-await': 'off',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
      },
    },
    {
      files: ['app/**/{page,layout,loading,error,not-found}.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
