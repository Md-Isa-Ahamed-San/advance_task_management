import { Suspense } from 'react'
import Link from 'next/link'
import { getSession } from '~/server/better-auth/server'
import {
  getTasksDueToday,
  getOverdueTasks,
  getUpcomingTasks,
  getThisWeekTasks,
  getHighPriorityTasks,
  getRecentTasks,
  getPriorityTaskCounts,
} from '~/server/queries/tasks'
import {
  getTaskStats,
  getPriorityDistribution,
  getWeeklyTrend,
  getCategoryBreakdown,
} from '~/server/queries/stats'
import { StatsGrid } from '@/app/components/dashboard/StatsGrid'
import { CategoryTable } from '@/app/components/dashboard/CategoryTable'
import { DashboardCharts } from '@/app/components/dashboard/DashboardCharts'
import { TaskProgressSection } from '@/app/components/home/TaskProgressSection'
import { HomeWidgets } from '@/app/components/home/HomeWidgets'
import {
  CalendarDays,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export const metadata = {
  title: 'Home — TaskFlow',
  description: 'Your productivity hub — analytics, task progress, and daily overview.',
}

function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-2xl border"
      style={{ height, borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
    />
  )
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function HomePage() {
  const session = await getSession()
  const userId = session!.user.id

  // All data in one parallel fetch
  const [
    dueTodayTasks,
    overdueTasks,
    upcomingTasks,
    thisWeekTasks,
    highPriorityTasks,
    recentTasks,
    stats,
    priorities,
    trend,
    categories,
    priorityCounts,
  ] = await Promise.all([
    getTasksDueToday(userId),
    getOverdueTasks(userId),
    getUpcomingTasks(userId),
    getThisWeekTasks(userId),
    getHighPriorityTasks(userId),
    getRecentTasks(userId),
    getTaskStats(userId),
    getPriorityDistribution(userId),
    getWeeklyTrend(userId),
    getCategoryBreakdown(userId),
    getPriorityTaskCounts(userId),
  ])

  const firstName = session!.user.name.split(' ')[0]
  const hourNow = new Date().getHours()
  const greeting =
    hourNow < 12 ? 'Good morning' : hourNow < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Here&apos;s your productivity overview for today.
          </p>
        </div>
        {/* Quick KPI strip */}
        <div className="flex items-center gap-3 text-sm">
          {overdueTasks.length > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                color: 'var(--destructive)',
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {overdueTasks.length} overdue
            </span>
          )}
          {dueTodayTasks.length > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {dueTodayTasks.length} due today
            </span>
          )}
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <StatsGrid {...stats} />

      {/* ── Charts strip ── */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartSkeleton height={260} />
            <ChartSkeleton height={260} />
            <ChartSkeleton height={260} />
          </div>
        }
      >
        <DashboardCharts trend={trend} priorities={priorities} />
      </Suspense>

      {/* ── Category breakdown ── */}
      <CategoryTable data={categories} />

      {/* ── 3-column widgets: This Week / High Priority / Recent ── */}
      <HomeWidgets
        thisWeekTasks={thisWeekTasks}
        highPriorityTasks={highPriorityTasks}
        recentTasks={recentTasks}
      />

      {/* ── Due Today + Overdue + Upcoming as action cards, + Task Progress ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: action cards */}
        <div className="lg:col-span-2 space-y-4">

          {/* ─ Due Today ─ */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-3.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Due Today
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-normal tabular-nums"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {dueTodayTasks.length}
                  </span>
                </h2>
              </div>
              <Link
                href="/calendar"
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                View Calendar <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4">
              {dueTodayTasks.length === 0 ? (
                <p className="py-3 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Nothing due today — enjoy your day! ✨
                </p>
              ) : (
                <ul className="space-y-2">
                  {dueTodayTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)' }}
                      />
                      <span className="flex-1 font-medium" style={{ color: 'var(--foreground)' }}>
                        {task.title}
                      </span>
                      {task.category && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px]"
                          style={{ backgroundColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                        >
                          {task.category}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ─ Overdue ─ */}
          {overdueTasks.length > 0 && (
            <section
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: 'color-mix(in srgb, var(--destructive) 40%, var(--border))',
                backgroundColor: 'var(--card)',
              }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-3.5"
                style={{ borderColor: 'color-mix(in srgb, var(--destructive) 30%, var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: 'var(--destructive)' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>
                    Overdue
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-xs font-normal tabular-nums"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                        color: 'var(--destructive)',
                      }}
                    >
                      {overdueTasks.length}
                    </span>
                  </h2>
                </div>
                <Link
                  href="/tasks?filter=active"
                  className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--destructive)' }}
                >
                  Review Tasks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {overdueTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--destructive) 6%, var(--muted))',
                      }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: 'var(--destructive)' }}
                      />
                      <span className="flex-1 font-medium" style={{ color: 'var(--foreground)' }}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>
                          {formatDate(new Date(task.dueDate))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ─ Upcoming ─ */}
          <section
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-3.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--chart-2)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Upcoming
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-normal tabular-nums"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {upcomingTasks.length}
                  </span>
                </h2>
              </div>
              <Link
                href="/tasks?filter=active"
                className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ color: 'var(--chart-2)' }}
              >
                See All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4">
              {upcomingTasks.length === 0 ? (
                <p className="py-3 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  No upcoming tasks in the next 7 days 🏖️
                </p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.slice(0, 6).map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
                      style={{ backgroundColor: 'var(--muted)' }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)' }}
                      />
                      <span className="flex-1 font-medium" style={{ color: 'var(--foreground)' }}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {formatDate(new Date(task.dueDate))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Right column: Task Progress */}
        <TaskProgressSection
          overallRate={stats.completionRate}
          priorities={priorityCounts}
        />
      </div>

    </div>
  )
}
