import Link from 'next/link';

const HERO_SLIDES = [
  {
    title: 'Eid Collection 2026',
    subtitle: 'Discover the finest traditional & modern wear',
    cta: 'Shop Now',
    href: '/collections/eid-2026',
    bgColor: 'from-teal-700 to-teal-900',
  },
  {
    title: 'Electronics Festival',
    subtitle: 'Up to 40% off on smartphones & gadgets',
    cta: 'Explore Deals',
    href: '/deals/electronics',
    bgColor: 'from-blue-700 to-indigo-900',
  },
  {
    title: 'Free Delivery Week',
    subtitle: 'Free shipping on all orders over ৳1,000',
    cta: 'Shop All',
    href: '/shop',
    bgColor: 'from-orange-600 to-red-700',
  },
];

const FEATURED_CATEGORIES = [
  { name: 'Clothing', href: '/categories/clothing', icon: '👕', count: 1240 },
  { name: 'Electronics', href: '/categories/electronics', icon: '📱', count: 856 },
  { name: 'Home & Living', href: '/categories/home-living', icon: '🏠', count: 634 },
  { name: 'Beauty', href: '/categories/beauty', icon: '💄', count: 428 },
  { name: 'Sports', href: '/categories/sports', icon: '⚽', count: 312 },
  { name: 'Books', href: '/categories/books', icon: '📚', count: 567 },
];

const FEATURED_PRODUCTS = [
  { id: '1', name: 'Premium Cotton Panjabi', price: 2500, originalPrice: 3200, image: '/images/products/panjabi.jpg', slug: 'premium-cotton-panjabi', rating: 4.5, reviews: 128 },
  { id: '2', name: 'Jamdani Saree - Royal Blue', price: 8500, originalPrice: 12000, image: '/images/products/jamdani.jpg', slug: 'jamdani-saree-royal-blue', rating: 4.8, reviews: 89 },
  { id: '3', name: 'Wireless Earbuds Pro', price: 3200, originalPrice: 4500, image: '/images/products/earbuds.jpg', slug: 'wireless-earbuds-pro', rating: 4.3, reviews: 256 },
  { id: '4', name: 'Leather Messenger Bag', price: 4800, originalPrice: 6000, image: '/images/products/bag.jpg', slug: 'leather-messenger-bag', rating: 4.6, reviews: 67 },
  { id: '5', name: 'Nakshi Kantha Cushion Set', price: 1800, originalPrice: 2400, image: '/images/products/kantha.jpg', slug: 'nakshi-kantha-cushion', rating: 4.7, reviews: 43 },
  { id: '6', name: 'Smart Watch BD Edition', price: 5500, originalPrice: 7000, image: '/images/products/watch.jpg', slug: 'smart-watch-bd', rating: 4.4, reviews: 178 },
];

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export default function HomePage() {
  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative">
        <div className={`bg-gradient-to-r ${HERO_SLIDES[0].bgColor} px-4 py-20 text-white`}>
          <div className="mx-auto max-w-7xl">
            <div className="max-w-xl">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{HERO_SLIDES[0].title}</h1>
              <p className="mb-6 text-lg text-white/90">{HERO_SLIDES[0].subtitle}</p>
              <Link
                href={HERO_SLIDES[0].href}
                className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-teal-700 transition-transform hover:scale-105"
              >
                {HERO_SLIDES[0].cta}
              </Link>
            </div>
          </div>
        </div>
        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all ${i === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group flex flex-col items-center rounded-xl border bg-white p-6 text-center transition-all hover:border-teal-300 hover:shadow-md"
            >
              <span className="mb-3 text-4xl">{cat.icon}</span>
              <h3 className="font-medium text-gray-900 group-hover:text-teal-700">{cat.name}</h3>
              <span className="mt-1 text-xs text-gray-500">{cat.count} products</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/shop" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-xl border bg-white p-3 transition-all hover:shadow-lg"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    [Image]
                  </div>
                  {product.originalPrice > product.price && (
                    <span className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-teal-700">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  {'★'.repeat(Math.floor(product.rating))}
                  <span className="text-gray-400">({product.reviews})</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-teal-700">{formatBDT(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">{formatBDT(product.originalPrice)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-800 p-8 text-white">
            <h3 className="text-xl font-bold">Traditional Wear</h3>
            <p className="mt-2 text-teal-100">Authentic Bangladeshi clothing for every occasion</p>
            <Link href="/categories/clothing" className="mt-4 inline-block rounded-lg bg-white px-6 py-2 text-sm font-medium text-teal-700">
              Shop Now
            </Link>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
            <h3 className="text-xl font-bold">Flash Sale</h3>
            <p className="mt-2 text-orange-100">Up to 50% off on selected items — limited time!</p>
            <Link href="/deals" className="mt-4 inline-block rounded-lg bg-white px-6 py-2 text-sm font-medium text-red-600">
              View Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-2xl">🚚</span>
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-gray-400">On orders over ৳2,000</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-gray-400">bKash, Nagad, Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-2xl">↩️</span>
            <div>
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-400">7-day return policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-2xl">🇧🇩</span>
            <div>
              <p className="text-sm font-medium">Made in Bangladesh</p>
              <p className="text-xs text-gray-400">Supporting local businesses</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
