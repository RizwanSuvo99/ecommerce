export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
      <div className="flex gap-6">
        {/* Filters skeleton */}
        <div className="hidden w-64 space-y-4 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-5 w-24 rounded bg-gray-200" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="h-4 w-32 rounded bg-gray-200" />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Products grid skeleton */}
        <div className="flex-1">
          <div className="mb-4 flex justify-between">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-8 w-40 rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
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
