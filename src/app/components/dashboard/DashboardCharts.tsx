'use client'

import dynamic from 'next/dynamic'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl border"
      style={{ height, borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
    />
  )
}

// ── Dynamic imports (ssr:false allowed here — this is a Client Component) ─────

const WeeklyTrendChart = dynamic(
  () => import('./WeeklyTrendChart').then((m) => m.WeeklyTrendChart),
  { ssr: false, loading: () => <ChartSkeleton height={240} /> },
)

const PriorityChart = dynamic(
  () => import('./PriorityChart').then((m) => m.PriorityChart),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> },
)

// ── Props ─────────────────────────────────────────────────────────────────────

interface TrendPoint {
  dayShort: string
  created: number
  completed: number
}

interface PriorityPoint {
  priority: string
  label: string
  count: number
}

interface DashboardChartsProps {
  trend: TrendPoint[]
  priorities: PriorityPoint[]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardCharts({ trend, priorities }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Weekly trend — takes 2/3 width on large screens */}
      <div className="lg:col-span-2">
        <WeeklyTrendChart data={trend} />
      </div>

      {/* Priority chart — takes 1/3 */}
      <div>
        <PriorityChart data={priorities} />
      </div>
    </div>
  )
}
