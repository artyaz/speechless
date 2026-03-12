export default function PracticeLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-28 animate-pulse rounded-lg bg-surface" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded-md bg-surface" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-elevated" />
              <div className="h-6 w-14 animate-pulse rounded-md bg-elevated" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-elevated" />
              <div className="h-3 w-full animate-pulse rounded-md bg-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
