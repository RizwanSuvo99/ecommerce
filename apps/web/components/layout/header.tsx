'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MegaMenuCategory {
  name: string;
  href: string;
  subcategories: { name: string; href: string }[];
  featured?: { name: string; href: string; image: string }[];
}

const MEGA_MENU: MegaMenuCategory[] = [
  {
    name: 'Clothing',
    href: '/categories/clothing',
    subcategories: [
      { name: 'Panjabi', href: '/categories/clothing/panjabi' },
      { name: 'Saree', href: '/categories/clothing/saree' },
      { name: 'Salwar Kameez', href: '/categories/clothing/salwar-kameez' },
      { name: 'T-Shirts', href: '/categories/clothing/t-shirts' },
      { name: 'Shirts', href: '/categories/clothing/shirts' },
      { name: 'Jeans & Pants', href: '/categories/clothing/jeans-pants' },
    ],
    featured: [
      { name: 'Eid Collection', href: '/collections/eid', image: '/images/collections/eid.jpg' },
    ],
  },
  {
    name: 'Electronics',
    href: '/categories/electronics',
    subcategories: [
      { name: 'Smartphones', href: '/categories/electronics/smartphones' },
      { name: 'Laptops', href: '/categories/electronics/laptops' },
      { name: 'Headphones', href: '/categories/electronics/headphones' },
      { name: 'Cameras', href: '/categories/electronics/cameras' },
      { name: 'Accessories', href: '/categories/electronics/accessories' },
    ],
  },
  {
    name: 'Home & Living',
    href: '/categories/home-living',
    subcategories: [
      { name: 'Furniture', href: '/categories/home-living/furniture' },
      { name: 'Bedding', href: '/categories/home-living/bedding' },
      { name: 'Kitchen', href: '/categories/home-living/kitchen' },
      { name: 'Decor', href: '/categories/home-living/decor' },
    ],
  },
];

export function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(3);
  const [wishlistCount] = useState(2);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveMega(null);
  }, [pathname]);

  return (
    <header className={`z-50 w-full transition-shadow ${isSticky ? 'sticky top-0 shadow-md' : ''}`}>
      {/* Top bar */}
      <div className="bg-teal-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span>Free delivery on orders over ৳2,000 | Made in Bangladesh 🇧🇩</span>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:underline">Track Order</Link>
            <Link href="/help" className="hover:underline">Help</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-teal-700">BD</span>
            <span className="text-2xl font-bold text-gray-800">Shop</span>
          </Link>

          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands, categories..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-10 pr-20 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button className="absolute right-2 top-1.5 rounded-md bg-teal-600 px-4 py-1.5 text-sm text-white hover:bg-teal-700">
              Search
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-5">
            <Link href="/account" className="flex flex-col items-center text-gray-600 hover:text-teal-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Account</span>
            </Link>

            <Link href="/wishlist" className="relative flex flex-col items-center text-gray-600 hover:text-teal-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {wishlistCount}
                </span>
              )}
              <span className="text-xs">Wishlist</span>
            </Link>

            <Link href="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-teal-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
              <span className="text-xs">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mega menu navigation */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          {/* All categories button */}
          <button className="flex items-center gap-2 border-r bg-teal-600 px-5 py-3 text-sm font-medium text-white hover:bg-teal-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All Categories
          </button>

          {/* Category links with mega menu */}
          <div className="flex">
            {MEGA_MENU.map((category) => (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => setActiveMega(category.name)}
                onMouseLeave={() => setActiveMega(null)}
              >
                <Link
                  href={category.href}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    activeMega === category.name ? 'bg-gray-50 text-teal-700' : 'text-gray-700 hover:text-teal-700'
                  }`}
                >
                  {category.name}
                </Link>

                {/* Mega menu dropdown */}
                {activeMega === category.name && (
                  <div className="absolute left-0 top-full z-50 w-[600px] rounded-b-lg border bg-white p-6 shadow-lg">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">{category.name}</h3>
                        <ul className="space-y-2">
                          {category.subcategories.map((sub) => (
                            <li key={sub.href}>
                              <Link href={sub.href} className="text-sm text-gray-600 hover:text-teal-700">
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {category.featured && (
                        <div>
                          <h3 className="mb-3 text-sm font-semibold text-gray-900">Featured</h3>
                          {category.featured.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                            >
                              <span className="text-sm font-medium text-teal-700">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/new-arrivals" className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-teal-700">
              New Arrivals
            </Link>
            <Link href="/deals" className="px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700">
              🔥 Deals
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
