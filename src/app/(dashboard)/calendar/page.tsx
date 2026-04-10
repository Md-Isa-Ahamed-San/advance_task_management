import Link from 'next/link'
import { getSession } from '~/server/better-auth/server'
import { getTasksByMonth, getCalendarUpcomingTasks } from '~/server/queries/tasks'
import { CalendarDayPanel } from '@/app/components/calendar/CalendarDayPanel'
import { CalendarRightPanel } from '@/app/components/calendar/CalendarRightPanel'
import { AddTaskButton } from '@/app/components/tasks/TaskForm'
import { ChevronLeft, CalendarDays } from 'lucide-react'

export const metadata = {
  title: 'Calendar — TaskFlow',
}

interface CalendarPageProps {
  searchParams: Promise<{
    month?: string
    year?:  string
    day?:   string
  }>
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PRIORITY_BG: Record<string, string> = {
  HIGH:   '#ef4444',
  MEDIUM: '#f97316',
  LOW:    '#10b981',
}

/** UTC-safe day extraction — avoids timezone-induced off-by-one */
function getUTCDayNum(date: Date): number {
  return new Date(date).getUTCDate()
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await getSession()
  const params  = await searchParams

  const now   = new Date()
  const year  = Number(params.year  ?? now.getFullYear())
  const month = Number(params.month ?? now.getMonth() + 1)
  const selectedDay = params.day ? Number(params.day) : null

  // Parallel fetch — month tasks + calendar upcoming (overdue + today + next 14 days)
  const [tasks, upcomingTasks] = await Promise.all([
    getTasksByMonth(session!.user.id, year, month),
    getCalendarUpcomingTasks(session!.user.id),
  ])

  // Map day → tasks (UTC-safe)
  const tasksByDay = new Map<number, typeof tasks>()
  for (const task of tasks) {
    if (task.dueDate) {
      const day = getUTCDayNum(new Date(task.dueDate))
      tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), task])
    }
  }

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const daysInMonth     = new Date(year, month, 0).getDate()

  const prevMonth = month === 1  ? 12 : month - 1
  const prevYear  = month === 1  ? year - 1 : year
  const nextMonth = month === 12 ? 1  : month + 1
  const nextYear  = month === 12 ? year + 1 : year

  const selectedDayTasks = selectedDay ? (tasksByDay.get(selectedDay) ?? []) : []

  const todayDay   = now.getDate()
  const todayMonth = now.getMonth() + 1
  const todayYear  = now.getFullYear()

  // Month stats
  const completedCount = tasks.filter((t) => t.completed).length
  const overdueCount   = tasks.filter(
    (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
  ).length

  return (
    <div className="flex h-full flex-col p-6 gap-5 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            {MONTH_NAMES[month - 1]} {year}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm flex-wrap">
            <span style={{ color: 'var(--muted-foreground)' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} this month
            </span>
            {completedCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, #22c55e 12%, transparent)',
                  color: '#16a34a',
                }}
              >
                ✓ {completedCount} done
              </span>
            )}
            {overdueCount > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                  color: 'var(--destructive)',
                }}
              >
                ⚠ {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AddTaskButton />
          <Link
            href={`/calendar?month=${prevMonth}&year=${prevYear}`}
            className="flex items-center justify-center h-10 w-10 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={`/calendar?month=${todayMonth}&year=${todayYear}`}
            className="flex items-center gap-1.5 rounded-xl border px-3 h-10 text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          >
            <CalendarDays className="h-4 w-4" />
            Today
          </Link>
          <Link
            href={`/calendar?month=${nextMonth}&year=${nextYear}`}
            className="flex items-center justify-center h-10 w-10 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
            aria-label="Next month"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>

      {/* ── Main layout: Calendar  |  Right sidebar ── */}
      <div className="grid flex-1 min-h-0 gap-5 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">

        {/* ── Calendar grid ── */}
        <div className="overflow-x-auto overflow-y-hidden pb-4 md:pb-0">
          <div
            className="rounded-2xl border overflow-hidden self-start min-w-[700px] md:min-w-0"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
          {/* Day-of-week headers */}
          <div
            className="grid grid-cols-7 border-b"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Empty leading cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[88px] border-r border-b"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
              />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dayTasks   = tasksByDay.get(day) ?? []
              const isToday    = day === todayDay && month === todayMonth && year === todayYear
              const isSelected = day === selectedDay
              const isPast     =
                new Date(year, month - 1, day) <
                new Date(todayYear, todayMonth - 1, todayDay)

              const hasOverdue = dayTasks.some((t) => !t.completed && isPast)
              const hasDone    = dayTasks.some((t) => t.completed)
              const hasActive  = dayTasks.some((t) => !t.completed)

              return (
                <Link
                  key={day}
                  href={`/calendar?month=${month}&year=${year}${isSelected ? '' : `&day=${day}`}`}
                  className="relative min-h-[88px] border-r border-b p-2 transition-colors hover:opacity-90"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: isSelected
                      ? 'color-mix(in srgb, var(--primary) 8%, var(--card))'
                      : isToday
                        ? 'color-mix(in srgb, var(--primary) 3%, var(--card))'
                        : 'var(--card)',
                  }}
                >
                  {/* Top accent bar for selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-x-0 top-0 h-0.5"
                      style={{ backgroundColor: 'var(--primary)' }}
                    />
                  )}

                  {/* Day number + status dots */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                        color: isToday
                          ? 'var(--primary-foreground)'
                          : isSelected
                            ? 'var(--primary)'
                            : 'var(--foreground)',
                      }}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5">
                        {hasActive && !hasOverdue && (
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                        )}
                        {hasOverdue && (
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--destructive)' }} />
                        )}
                        {hasDone && (
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Task chips */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isTaskOverdue =
                        !task.completed && task.dueDate && new Date(task.dueDate) < now
                      return (
                        <div
                          key={task.id}
                          className="truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4"
                          style={{
                            backgroundColor: task.completed
                              ? 'color-mix(in srgb, #22c55e 18%, transparent)'
                              : isTaskOverdue
                                ? 'color-mix(in srgb, var(--destructive) 18%, transparent)'
                                : `color-mix(in srgb, ${PRIORITY_BG[task.priority] ?? '#6366f1'} 18%, transparent)`,
                            color: task.completed
                              ? '#16a34a'
                              : isTaskOverdue
                                ? 'var(--destructive)'
                                : (PRIORITY_BG[task.priority] ?? 'var(--primary)'),
                            textDecoration: task.completed ? 'line-through' : 'none',
                          }}
                        >
                          {task.completed ? '✓ ' : ''}
                          {task.teamId && (
                            <span className="mr-1 inline-flex items-center rounded bg-primary/20 px-1 py-0.5 text-[9px] font-extrabold text-primary">
                              WORK
                            </span>
                          )}
                          {task.title}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="px-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}

            {/* Trailing empty cells to complete the last row */}
            {(() => {
              const total     = firstDayOfMonth + daysInMonth
              const remainder = total % 7
              const trailing  = remainder === 0 ? 0 : 7 - remainder
              return Array.from({ length: trailing }).map((_, i) => (
                <div
                  key={`trail-${i}`}
                  className="min-h-[88px] border-r border-b"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                />
              ))
            })()}
          </div>
        </div>
        </div>

        {/* ── Right sidebar — always visible ── */}
        <div className="flex flex-col gap-4 overflow-y-auto">

          {/* Day panel — only when a day is selected */}
          {selectedDay && (
            <div
              className="rounded-2xl border overflow-hidden shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <CalendarDayPanel
                tasks={selectedDayTasks}
                day={selectedDay}
                month={month}
                year={year}
              />
            </div>
          )}

          {/* Upcoming + This Month panels */}
          <CalendarRightPanel
            upcomingTasks={upcomingTasks}
            monthTasks={tasks}
          />
        </div>

      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 text-[11px] shrink-0"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          Active
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--destructive)' }} />
          Overdue
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
          Completed
        </div>
        <span className="ml-auto">Click any day to inspect tasks</span>
      </div>

    </div>
  )
}
