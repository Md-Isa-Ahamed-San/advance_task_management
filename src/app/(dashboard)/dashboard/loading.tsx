function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ''}`}
      style={{ backgroundColor: 'var(--muted)' }}
    />
  )
}

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      {/* Category table */}
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}
