interface StatsGridProps {
  total: number
  completed: number
  active: number
  overdue: number
  completionRate: number
}

const STAT_ITEMS = (p: StatsGridProps) => [
  {
    label: 'Total Tasks',
    value: p.total,
    sub: `${p.completionRate}% complete`,
    color: 'var(--primary)',
    bg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    icon: '📋',
  },
  {
    label: 'Active',
    value: p.active,
    sub: 'In progress',
    color: 'var(--chart-3)',
    bg: 'color-mix(in srgb, var(--chart-3) 12%, transparent)',
    icon: '⚡',
  },
  {
    label: 'Completed',
    value: p.completed,
    sub: 'All time',
    color: 'var(--chart-2)',
    bg: 'color-mix(in srgb, var(--chart-2) 12%, transparent)',
    icon: '✅',
  },
  {
    label: 'Overdue',
    value: p.overdue,
    sub: p.overdue > 0 ? 'Needs attention' : "You're on track!",
    color: p.overdue > 0 ? 'var(--destructive)' : 'var(--chart-2)',
    bg: p.overdue > 0
      ? 'color-mix(in srgb, var(--destructive) 12%, transparent)'
      : 'color-mix(in srgb, var(--chart-2) 12%, transparent)',
    icon: p.overdue > 0 ? '⚠️' : '🎯',
  },
]

export function StatsGrid(props: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STAT_ITEMS(props).map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:shadow-md"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {/* Gradient accent top bar */}
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ backgroundColor: stat.color }}
          />

          {/* Icon badge */}
          <div
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: stat.bg }}
          >
            {stat.icon}
          </div>

          <p
            className="text-3xl font-bold tabular-nums tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {stat.value > 999 ? '999+' : stat.value}
          </p>
          <p className="mt-0.5 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {stat.label}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
