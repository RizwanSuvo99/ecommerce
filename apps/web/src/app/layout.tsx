import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-noto-sans-bengali',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Ecommerce — Shop the Best Deals Online',
    template: '%s | Ecommerce',
  },
  description:
    'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more with fast delivery and secure payments.',
  keywords: [
    'ecommerce',
    'online shopping',
    'best deals',
    'electronics',
    'fashion',
    'home goods',
  ],
  authors: [{ name: 'Ecommerce Team' }],
  creator: 'Ecommerce',
  publisher: 'Ecommerce',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Ecommerce',
    title: 'Ecommerce — Shop the Best Deals Online',
    description:
      'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecommerce — Shop the Best Deals Online',
    description:
      'Discover amazing products at great prices. Shop electronics, fashion, home goods, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansBengali.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
