function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ''}`}
      style={{ backgroundColor: 'var(--muted)', ...style }}
    />
  )
}

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-7 w-44 rounded-xl" />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border p-5 space-y-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-2xl border p-1.5"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="flex-1 h-11 rounded-xl" style={{ backgroundColor: 'var(--card)' }} />
        ))}
      </div>

      {/* Tab content placeholder */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  )
}
