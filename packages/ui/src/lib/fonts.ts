import { Inter, Noto_Sans_Bengali } from 'next/font/google';

/**
 * Inter — primary sans-serif font for the application.
 *
 * Used for all UI text, headings, and body copy in Latin scripts.
 * Variable font with full weight axis (100-900).
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

/**
 * Noto Sans Bengali — Bengali (বাংলা) script support.
 *
 * Used for Bangla content throughout the e-commerce platform.
 * Variable font with weight axis (100-900).
 */
export const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-noto-sans-bengali',
  weight: ['400', '500', '600', '700'],
  fallback: ['sans-serif'],
});

/**
 * CSS variable class names to apply on the root `<html>` element.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { fontVariables } from '@ecommerce/ui/lib/fonts';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html className={fontVariables}>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export const fontVariables = `${inter.variable} ${notoSansBengali.variable}`;

/**
 * Font class names object for selective application.
 */
export const fonts = {
  inter,
  notoSansBengali,
  /** Combined CSS variable string */
  variables: fontVariables,
} as const;
