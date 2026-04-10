function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ''}`}
      style={{ backgroundColor: 'var(--muted)' }}
    />
  )
}

export default function TeamsLoading() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="flex w-72 shrink-0 flex-col border-r" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
      {/* Main panel */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="flex border-b px-6 gap-6 py-1" style={{ borderColor: 'var(--border)' }}>
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-24" />)}
        </div>
        <div className="p-6 space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  )
}
