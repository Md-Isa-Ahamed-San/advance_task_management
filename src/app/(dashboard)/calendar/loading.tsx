function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ''}`}
      style={{ backgroundColor: 'var(--muted)' }}
    />
  )
}

export default function CalendarLoading() {
  return (
    <div className="flex flex-col p-6 gap-5 max-w-[1600px]">

      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">

        {/* Calendar card */}
        <div
          className="rounded-2xl border overflow-hidden self-start"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {/* Day headers */}
          <div
            className="grid grid-cols-7 h-10 border-b"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border-r last:border-r-0" style={{ borderColor: 'var(--border)' }} />
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[88px] border-r border-b animate-pulse"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: i % 7 === 0 || i % 7 === 6 ? 'var(--muted)' : 'var(--card)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 shrink-0">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-20" />)}
      </div>
    </div>
  )
}
