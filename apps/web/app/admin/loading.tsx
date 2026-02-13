export default function AdminLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200" />

      {/* Stats cards skeleton */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-5">
            <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
