'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_SECTIONS = [
  {
    title: 'Shop',
    items: [
      { label: 'All Products', href: '/shop' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Best Sellers', href: '/best-sellers' },
      { label: 'Deals & Offers', href: '/deals' },
    ],
  },
  {
    title: 'Categories',
    items: [
      { label: 'Clothing', href: '/categories/clothing' },
      { label: 'Electronics', href: '/categories/electronics' },
      { label: 'Home & Living', href: '/categories/home-living' },
      { label: 'Beauty & Health', href: '/categories/beauty-health' },
      { label: 'Sports & Outdoors', href: '/categories/sports' },
      { label: 'Books & Stationery', href: '/categories/books' },
    ],
  },
  {
    title: 'My Account',
    items: [
      { label: 'Profile', href: '/account' },
      { label: 'My Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Addresses', href: '/account/addresses' },
    ],
  },
  {
    title: 'Help',
    items: [
      { label: 'Track Order', href: '/track-order' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Returns & Refunds', href: '/returns' },
    ],
  },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<string | null>('Shop');

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <Link href="/" className="text-xl font-bold text-teal-700" onClick={onClose}>
            BDShop
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-lg border px-4 py-2 pl-10 text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="border-b">
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.title ? null : section.title,
                )}
                className="flex w-full items-center justify-between px-4 py-3 font-medium text-gray-900"
              >
                {section.title}
                <svg
                  className={`h-4 w-4 transition-transform ${
                    expandedSection === section.title ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSection === section.title && (
                <div className="bg-gray-50 pb-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-8 py-2 text-sm ${
                        pathname === item.href ? 'font-medium text-teal-700' : 'text-gray-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg border border-teal-600 px-4 py-2 text-center text-sm font-medium text-teal-600"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white"
            >
              Register
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>🇧🇩</span>
            <span>English</span>
            <span>|</span>
            <span>বাংলা</span>
          </div>
        </div>
      </div>
    </>
  );
}
