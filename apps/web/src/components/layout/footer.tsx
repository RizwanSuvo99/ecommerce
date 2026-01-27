import Link from 'next/link';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Brands', href: '/brands' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Sale', href: '/products?sale=true' },
  ],
  account: [
    { label: 'My Account', href: '/account' },
    { label: 'Order History', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
    { label: 'Track Order', href: '/account/orders' },
  ],
  info: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Return Policy', href: '/return-policy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              ShopBD
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Your trusted online shopping destination in Bangladesh. Quality
              products at the best prices.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য।
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Account
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Information
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ShopBD. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                Payments accepted: bKash, Visa, Mastercard, COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
