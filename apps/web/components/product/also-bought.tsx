'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AlsoBoughtProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface AlsoBoughtProps {
  products: AlsoBoughtProduct[];
}

function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function AlsoBought({ products }: AlsoBoughtProps) {
  if (products.length === 0) return null;

  const total = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <section className="rounded-xl border bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Frequently Bought Together</h2>

      <div className="flex flex-wrap items-center gap-3">
        {products.slice(0, 3).map((product, i) => (
          <div key={product.id} className="flex items-center gap-3">
            {i > 0 && <span className="text-2xl font-light text-gray-300">+</span>}
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                <p className="text-sm font-bold text-teal-700">{formatBDT(product.price)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-4">
        <div>
          <p className="text-sm text-gray-500">Total price for all items:</p>
          <p className="text-xl font-bold text-teal-700">{formatBDT(total)}</p>
        </div>
        <button className="rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700">
          Add All to Cart
        </button>
      </div>
    </section>
  );
}
