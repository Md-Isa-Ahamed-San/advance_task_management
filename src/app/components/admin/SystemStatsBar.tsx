interface SystemStatsBarProps {
  totalUsers:      number
  activeUsers:     number
  totalTasks:      number
  completedTasks:  number
  completionRate:  number
}

const STATS = (p: SystemStatsBarProps) => [
  {
    label:  'Active Users',
    value:  p.activeUsers,
    sub:    `of ${p.totalUsers} total`,
    icon:   '👥',
    color:  'var(--primary)',
  },
  {
    label:  'Total Tasks',
    value:  p.totalTasks,
    sub:    'system-wide',
    icon:   '📋',
    color:  'var(--chart-2)',
  },
  {
    label:  'Completed Tasks',
    value:  p.completedTasks,
    sub:    'all time',
    icon:   '✅',
    color:  '#22c55e',
  },
  {
    label:  'Completion Rate',
    value:  `${p.completionRate}%`,
    sub:    'completed / total',
    icon:   '📈',
    color:  p.completionRate >= 70 ? '#22c55e' : p.completionRate >= 40 ? '#f97316' : 'var(--destructive)',
  },
]

export function SystemStatsBar(props: SystemStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STATS(props).map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}
          >
            {stat.icon}
          </div>
          <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--foreground)' }}>
            {stat.value}
          </p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {stat.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
