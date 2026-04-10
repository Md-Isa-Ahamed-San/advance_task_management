import Link from 'next/link'

interface TaskStatsProps {
  total:     number
  active:    number
  completed: number
  overdue:   number
  baseUrl?:  string // If provided, cards link to this instead of /tasks
}

const STATS = (props: TaskStatsProps) => [
  {
    label:   'Total',
    value:   props.total,
    danger:  false,
    icon:    '📋',
    color:   'var(--primary)',
    bg:      'color-mix(in srgb, var(--primary) 10%, transparent)',
    href:    props.baseUrl ?? '/tasks',
  },
  {
    label:   'Active',
    value:   props.active,
    danger:  false,
    icon:    '⚡',
    color:   'var(--chart-3)',
    bg:      'color-mix(in srgb, var(--chart-3) 10%, transparent)',
    href:    props.baseUrl ? `${props.baseUrl}?filter=active` : '/tasks?filter=active',
  },
  {
    label:   'Completed',
    value:   props.completed,
    danger:  false,
    icon:    '✅',
    color:   'var(--chart-2)',
    bg:      'color-mix(in srgb, var(--chart-2) 10%, transparent)',
    href:    props.baseUrl ? `${props.baseUrl}?filter=completed` : '/tasks?filter=completed',
  },
  {
    label:   'Overdue',
    value:   props.overdue,
    danger:  props.overdue > 0,
    icon:    props.overdue > 0 ? '⚠️' : '🎯',
    color:   props.overdue > 0 ? 'var(--destructive)' : 'var(--chart-2)',
    bg:      props.overdue > 0
      ? 'color-mix(in srgb, var(--destructive) 10%, transparent)'
      : 'color-mix(in srgb, var(--chart-2) 10%, transparent)',
    href:    props.baseUrl ? `${props.baseUrl}?filter=overdue` : '/tasks?filter=overdue',
  },
]

export function TaskStats(props: TaskStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS(props).map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="group rounded-2xl border p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {/* Top row */}
          <div className="flex items-start justify-between mb-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base"
              style={{ backgroundColor: stat.bg }}
            >
              {stat.icon}
            </div>
          </div>

          <p
            className="text-2xl font-bold tabular-nums tracking-tight"
            style={{ color: stat.danger ? 'var(--destructive)' : 'var(--foreground)' }}
          >
            {stat.value}
          </p>
          <p
            className="mt-0.5 text-xs font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stat.label}
          </p>
        </Link>
      ))}
    </div>
  )
}
