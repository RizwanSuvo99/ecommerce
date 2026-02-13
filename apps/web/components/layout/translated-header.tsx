'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LocaleSwitcher } from '../locale-switcher';

export function TranslatedHeader() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-teal-700 px-4 py-1.5 text-center text-xs text-white">
        {tc('madeInBangladesh')}
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-teal-700">
          {tc('appName')}
        </Link>

        {/* Search */}
        <div className="mx-8 hidden flex-1 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder={tc('search') + '...'}
              className="w-full rounded-lg border border-gray-200 px-4 py-2 pl-10 focus:border-teal-500 focus:outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <LocaleSwitcher variant="inline" />
          <Link href="/wishlist" className="text-sm text-gray-600 hover:text-teal-700">
            {t('wishlist')}
          </Link>
          <Link href="/cart" className="text-sm text-gray-600 hover:text-teal-700">
            {t('cart')}
          </Link>
          <Link href="/auth/login" className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700">
            {t('signIn')}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('home')}</Link>
          <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('shop')}</Link>
          <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('categories')}</Link>
          <Link href="/new-arrivals" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('newArrivals')}</Link>
          <Link href="/deals" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('deals')}</Link>
          <Link href="/brands" className="text-sm font-medium text-gray-700 hover:text-teal-700">{t('brands')}</Link>
        </div>
      </nav>
    </header>
  );
}
