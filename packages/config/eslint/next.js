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
    'react/no-unknown-property': ['error', { ignore: ['css', 'jsx', 'global'] }],
    'react/jsx-no-target-blank': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

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
    // Legacy interactive <div>/<span> click handlers are flagged but
    // not blocking. Keeping them as warnings surfaces new violations
    // without forcing a codebase-wide a11y sweep mid-feature work.
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    // Template-literal expression validation fires on admin-panel
    // text like `${user.role}` where `role` is a DB enum surface —
    // acknowledged as a smell but not blocking.
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
    // react/no-unescaped-entities trips on apostrophes inside copy;
    // worth warning about but not a blocker during storefront work.
    'react/no-unescaped-entities': 'warn',

    /* ── Next.js specific ───────────────────────────── */
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'warn',

    /* ── Override base for Next.js patterns ─────────── */
    '@typescript-eslint/require-await': 'off',
    // Fire-and-forget `router.push(...)` and in-effect fetches are an
    // idiomatic Next pattern. The warning is still useful; the hard
    // error tripped on every hook call that ignored a promise.
    '@typescript-eslint/no-floating-promises': 'warn',
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
