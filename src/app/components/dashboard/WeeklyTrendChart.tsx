'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface WeeklyTrendChartProps {
  data: {
    dayShort: string
    created: number
    completed: number
  }[]
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <div
      className="rounded-2xl border p-5 transition-all hover:shadow-sm"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Task Activity
          </h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Created vs completed over the last 7 days
          </p>
        </div>
      </div>

      {data.every((d) => d.created === 0 && d.completed === 0) ? (
        <div
          className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No activity in the past 7 days
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--primary)"  stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--primary)"  stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-2)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="dayShort"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: 'var(--shadow-lg)',
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: 'var(--muted-foreground)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)', paddingTop: '8px' }}
            />
            <Area
              type="monotone"
              dataKey="created"
              name="Created"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#gradCreated)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#gradCompleted)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
