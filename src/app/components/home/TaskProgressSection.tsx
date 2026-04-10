'use client'

import { useState } from 'react'
import { TaskForm } from '../tasks/TaskForm'
import { TrendingUp, Plus } from 'lucide-react'

interface PriorityCounts {
  high:   { total: number; completed: number; rate: number }
  medium: { total: number; completed: number; rate: number }
  low:    { total: number; completed: number; rate: number }
}

interface TaskProgressSectionProps {
  overallRate: number
  priorities: PriorityCounts
}

const PRIORITY_BARS = [
  { key: 'high'   as const, label: 'High',   color: 'var(--destructive)', bg: 'color-mix(in srgb, var(--destructive) 15%, transparent)' },
  { key: 'medium' as const, label: 'Medium', color: '#f97316',             bg: 'color-mix(in srgb, #f97316 15%, transparent)' },
  { key: 'low'    as const, label: 'Low',    color: 'var(--chart-2)',      bg: 'color-mix(in srgb, var(--chart-2) 15%, transparent)' },
]

export function TaskProgressSection({ overallRate, priorities }: TaskProgressSectionProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border p-5 space-y-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
        >
          <TrendingUp className="h-4 w-4" style={{ color: 'var(--primary)' }} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Task Progress
        </h3>
      </div>

      {/* Overall completion ring stat */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'var(--muted-foreground)' }}>Overall Completion</span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
            {overallRate}%
          </span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${overallRate}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            }}
          />
        </div>
      </div>

      {/* Priority bars */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
          Tasks by Priority
        </p>
        {PRIORITY_BARS.map(({ key, label, color, bg }) => {
          const data = priorities[key]
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: bg, color }}
                  >
                    {label}
                  </span>
                </div>
                <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                  {data.completed}/{data.total}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${data.rate}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={() => setCreateOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'var(--primary-foreground)',
        }}
      >
        <Plus className="h-4 w-4" />
        Create New Task
      </button>

      {createOpen && <TaskForm onClose={() => setCreateOpen(false)} />}
    </div>
  )
}
