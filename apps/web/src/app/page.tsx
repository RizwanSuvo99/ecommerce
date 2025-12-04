import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border">
            Launching soon.{' '}
            <Link href="/products" className="font-semibold text-primary">
              <span className="absolute inset-0" aria-hidden="true" />
              Browse products <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Shop the Best Deals Online
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Discover amazing products at great prices. From electronics to fashion,
          home goods to accessories — find everything you need with fast delivery
          and secure payments.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/products"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Start Shopping
          </Link>
          <Link
            href="/categories"
            className="text-sm font-semibold leading-6 text-foreground"
          >
            View Categories <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
