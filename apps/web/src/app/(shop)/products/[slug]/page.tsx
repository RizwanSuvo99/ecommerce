import Link from 'next/link';

interface ProductPageProps {
  params: { slug: string };
}

const MOCK_PRODUCT = {
  id: '1',
  name: 'Premium Cotton Panjabi - Navy Blue',
  slug: 'premium-cotton-panjabi-navy-blue',
  price: 2500,
  originalPrice: 3200,
  description: 'Handcrafted premium cotton panjabi made with the finest Bangladeshi cotton. Perfect for Eid, weddings, and special occasions. Features intricate embroidery work on the collar and cuffs.',
  images: ['/images/products/panjabi-1.jpg', '/images/products/panjabi-2.jpg', '/images/products/panjabi-3.jpg', '/images/products/panjabi-4.jpg'],
  sku: 'PNJ-NVY-001',
  brand: 'Aarong',
  category: 'Clothing > Panjabi',
  rating: 4.5,
  reviewCount: 128,
  inStock: true,
  stockCount: 45,
  variants: {
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Navy Blue', hex: '#1e3a5f' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Olive', hex: '#556b2f' },
    ],
  },
  specifications: [
    { key: 'Material', value: '100% Cotton' },
    { key: 'Origin', value: 'Bangladesh' },
    { key: 'Care', value: 'Machine wash cold' },
    { key: 'Fit', value: 'Regular fit' },
    { key: 'Pattern', value: 'Solid with embroidery' },
  ],
  freeShipping: true,
  estimatedDelivery: '3-5 business days',
};

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = MOCK_PRODUCT;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-700">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/categories/clothing" className="hover:text-teal-700">Clothing</Link>
        <span className="mx-2">/</span>
        <Link href="/categories/clothing/panjabi" className="hover:text-teal-700">Panjabi</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100">
            <div className="flex h-full items-center justify-center text-gray-400">
              [Main Product Image]
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 ${i === 0 ? 'border-teal-500' : 'border-transparent hover:border-gray-300'}`}
              >
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  [{i + 1}]
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href={`/brands/${product.brand.toLowerCase()}`} className="text-sm text-teal-600 hover:underline">
              {product.brand}
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">SKU: {product.sku}</span>
          </div>

          <h1 className="mb-3 text-2xl font-bold text-gray-900 lg:text-3xl">{product.name}</h1>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-teal-700">{formatBDT(product.price)}</span>
            <span className="text-lg text-gray-400 line-through">{formatBDT(product.originalPrice)}</span>
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
              {discount}% OFF
            </span>
          </div>

          {/* Color selection */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Color</h3>
            <div className="flex gap-2">
              {product.variants.colors.map((color) => (
                <button
                  key={color.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 hover:border-teal-500"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={color.name}
                >
                  {color.name === 'Navy Blue' && (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Size</h3>
              <button className="text-xs text-teal-600 hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.sizes.map((size) => (
                <button
                  key={size}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    size === 'L'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to cart */}
          <div className="mb-6 flex gap-3">
            <div className="flex items-center rounded-lg border">
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-50">-</button>
              <span className="w-12 text-center font-medium">1</span>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-50">+</button>
            </div>
            <button className="flex-1 rounded-lg bg-teal-600 px-8 py-3 font-semibold text-white hover:bg-teal-700">
              Add to Cart
            </button>
            <button className="rounded-lg border border-gray-300 px-4 py-3 text-gray-600 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <button className="mb-6 w-full rounded-lg border-2 border-teal-600 py-3 font-semibold text-teal-600 hover:bg-teal-50">
            Buy Now
          </button>

          {/* Delivery info */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center gap-3 text-sm">
              <span>🚚</span>
              <div>
                <p className="font-medium">{product.freeShipping ? 'Free Delivery' : 'Standard Delivery'}</p>
                <p className="text-gray-500">Estimated: {product.estimatedDelivery}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span>↩️</span>
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-gray-500">7-day return policy</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span>✅</span>
              <div>
                <p className="font-medium text-green-600">{product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specifications / Reviews */}
      <div className="mt-12">
        <div className="flex border-b">
          {['Description', 'Specifications', `Reviews (${product.reviewCount})`].map((tab, i) => (
            <button
              key={tab}
              className={`px-6 py-3 text-sm font-medium ${
                i === 0 ? 'border-b-2 border-teal-600 text-teal-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="py-6">
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="mt-6">
            <table className="w-full">
              <tbody>
                {product.specifications.map((spec) => (
                  <tr key={spec.key} className="border-b">
                    <td className="py-2 pr-4 text-sm font-medium text-gray-500">{spec.key}</td>
                    <td className="py-2 text-sm text-gray-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
