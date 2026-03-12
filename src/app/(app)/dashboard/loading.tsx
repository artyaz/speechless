export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-surface" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-elevated" />
                <div className="h-3 w-20 animate-pulse rounded bg-elevated" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded-lg bg-elevated" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
          <div className="mb-4 h-4 w-28 animate-pulse rounded bg-elevated" />
          <div className="h-56 w-full animate-pulse rounded-lg bg-elevated" />
        </div>

        {/* Weak phonemes skeleton */}
        <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
          <div className="mb-4 h-4 w-28 animate-pulse rounded bg-elevated" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-elevated"
              />
            ))}
          </div>
        </div>

        {/* Recent sessions skeleton */}
        <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
          <div className="mb-4 h-4 w-28 animate-pulse rounded bg-elevated" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-elevated"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
