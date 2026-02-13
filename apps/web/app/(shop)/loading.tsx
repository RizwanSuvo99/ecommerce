export default function ShopLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-80 bg-gray-200" />

      {/* Categories skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mx-auto mb-8 h-8 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center rounded-xl border p-6">
              <div className="mb-3 h-12 w-12 rounded-full bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-3">
                <div className="mb-3 aspect-square rounded-lg bg-gray-200" />
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="mt-2 h-6 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
