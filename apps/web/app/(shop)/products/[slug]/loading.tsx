export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 h-4 w-64 rounded bg-gray-200" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery skeleton */}
        <div>
          <div className="mb-4 aspect-square rounded-xl bg-gray-200" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-10 w-28 rounded bg-gray-200" />
            <div className="h-10 w-20 rounded bg-gray-200" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-10 rounded-full bg-gray-200" />
            ))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-14 rounded-lg bg-gray-200" />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-28 rounded-lg bg-gray-200" />
            <div className="h-12 flex-1 rounded-lg bg-gray-200" />
          </div>
          <div className="h-12 w-full rounded-lg bg-gray-200" />
          <div className="h-32 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
