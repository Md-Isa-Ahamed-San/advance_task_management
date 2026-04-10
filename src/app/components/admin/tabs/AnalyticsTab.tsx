'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { AdminStats, CompletionTrendDay, GlobalPriorityItem, GlobalCategoryItem } from '~/server/queries/admin'

interface AnalyticsTabProps {
  stats:      AdminStats
  trend:      CompletionTrendDay[]
  priorities: GlobalPriorityItem[]
  categories: GlobalCategoryItem[]
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

const QUICK_STATS = (s: AdminStats) => [
  { label: 'Active Users',     value: s.activeUsers,      icon: '👥', color: 'var(--primary)',     note: `of ${s.totalUsers} total` },
  { label: 'Total Tasks',      value: s.totalTasks,       icon: '📋', color: 'var(--chart-2)',     note: 'system-wide' },
  { label: 'Completed Tasks',  value: s.completedTasks,   icon: '✅', color: '#22c55e',           note: `${s.completionRate}% rate` },
  { label: 'Active Tasks',     value: s.activeTasks,      icon: '⚡', color: 'var(--chart-3)',     note: 'in progress' },
  { label: 'Overdue Tasks',    value: s.overdueTasks,     icon: '⚠️', color: 'var(--destructive)', note: 'past due date' },
  { label: 'Completion Rate',  value: `${s.completionRate}%`, icon: '📈', color: 'var(--primary)', note: 'all time' },
]

const DEEP_STATS = (s: AdminStats) => [
  { label: 'Avg Tasks / User',   value: s.avgTasksPerUser,     icon: '📊' },
  { label: 'High Priority',      value: s.highPriorityTasks,   icon: '🔴' },
  { label: 'With Due Dates',     value: s.tasksWithDueDates,   icon: '📅' },
  { label: 'Due Today',          value: s.tasksDueToday,       icon: '🗓️' },
  { label: 'Due This Week',      value: s.tasksDueThisWeek,    icon: '📆' },
  { label: 'Active Sessions',    value: s.activeSessions,      icon: '🔐' },
  { label: 'Total Teams',        value: s.totalTeams,          icon: '👤' },
  { label: 'Total Messages',     value: s.totalMessages,       icon: '💬' },
  { label: 'Activity Log Entries', value: s.totalLogs,         icon: '📝' },
]

export function AnalyticsTab({ stats, trend, priorities, categories }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">

      {/* ── Quick Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {QUICK_STATS(stats).map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-4 transition-all hover:shadow-md"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div
              className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--foreground)' }}>
              {stat.value}
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{stat.label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{stat.note}</p>
          </div>
        ))}
      </div>

      {/* ── Deep Stats Grid ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>System Insights</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Aggregated metrics across all users</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-y" style={{ borderColor: 'var(--border)' }}>
          {DEEP_STATS(stats).map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-5 py-4">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <p className="text-lg font-bold tabular-nums leading-tight" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Completion Trend */}
        <div
          className="rounded-2xl border p-5 lg:col-span-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <h3 className="mb-0.5 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Task Activity — Last 14 Days</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>Created vs completed tasks per day</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              />
              <Bar dataKey="created"   name="Created"   fill="var(--primary)"  radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="var(--chart-2)"  radius={[3, 3, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Donut */}
        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <h3 className="mb-0.5 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Priority Distribution</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>All tasks by priority level</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={priorities} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="count" nameKey="label">
                {priorities.map((entry) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? 'var(--muted)'} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {priorities.map((p) => (
              <div key={p.priority} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.priority] }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>{p.label}</span>
                </div>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Top Categories</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Task distribution by category</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {categories.map((cat, i) => {
              const colors = ['var(--primary)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', '#f43f5e']
              const color  = colors[i % colors.length]!
              return (
                <div key={cat.category} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium capitalize" style={{ color: 'var(--foreground)' }}>{cat.category}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.rate}%`, backgroundColor: color }} />
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{cat.completed}/{cat.total}</span>
                    <span className="w-10 text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{cat.rate}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
