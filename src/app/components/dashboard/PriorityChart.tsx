'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PriorityChartProps {
  data: {
    priority: string
    label: string
    count: number
  }[]
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

export function PriorityChart({ data }: PriorityChartProps) {
  const allZero = data.every((d) => d.count === 0)
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div
      className="rounded-2xl border p-5 transition-all hover:shadow-sm"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Priority Distribution
        </h3>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Breakdown across {total} tasks
        </p>
      </div>

      {allZero ? (
        <div
          className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-center">
            <p className="text-xl mb-1">🎯</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No tasks yet
            </p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="count"
                nameKey="label"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.priority}
                    fill={PRIORITY_COLORS[entry.priority] ?? 'var(--muted-foreground)'}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--muted-foreground)' }}
                formatter={(value, name) => {
                  const num = typeof value === 'number' ? value : 0
                  return [
                    `${num} tasks (${total > 0 ? Math.round((num / total) * 100) : 0}%)`,
                    String(name),
                  ] as [string, string]
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '4px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend-style breakdown */}
          <div className="mt-3 space-y-2">
            {data.map((d) => (
              <div key={d.priority} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[d.priority] ?? 'var(--muted)' }}
                  />
                  <span style={{ color: 'var(--muted-foreground)' }}>{d.label}</span>
                </div>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
