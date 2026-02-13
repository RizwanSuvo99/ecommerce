'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function TranslatedFooter() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{tc('appName')}</h3>
            <p className="text-sm">{tc('madeInBangladesh')}</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">{t('shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/new-arrivals" className="hover:text-teal-400">{t('newArrivals')}</Link></li>
              <li><Link href="/best-sellers" className="hover:text-teal-400">{t('bestSellers')}</Link></li>
              <li><Link href="/deals" className="hover:text-teal-400">{t('deals')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">{t('help')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/track-order" className="hover:text-teal-400">{t('trackOrder')}</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400">{t('contact')}</Link></li>
              <li><Link href="/about" className="hover:text-teal-400">{t('about')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">{t('myAccount')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-teal-400">{t('signIn')}</Link></li>
              <li><Link href="/wishlist" className="hover:text-teal-400">{t('wishlist')}</Link></li>
              <li><Link href="/cart" className="hover:text-teal-400">{t('cart')}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © 2026 {tc('appName')}. All rights reserved.
      </div>
    </footer>
  );
}
