'use client'

import type { Task } from '../../../../generated/prisma'
import { CalendarDays, Clock, CheckCircle2, Circle, Loader2, Flag } from 'lucide-react'
import { useToggleComplete } from '~/hooks/use-toggle-complete'
import { useState } from 'react'
import { TaskForm } from '../tasks/TaskForm'

// ── Helpers ─────────────────────────────────────────────────────────────────

function getRelativeDay(dueDate: Date, now: Date): string {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const diffMs   = due.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0)  return 'Today'
  if (diffDays === 1)  return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 6) return `In ${diffDays} days`
  if (diffDays > 6 && diffDays <= 13) return 'Next week'
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDayBadgeStyle(dueDate: Date, now: Date): { bg: string; color: string } {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0)  return { bg: 'color-mix(in srgb, var(--destructive) 12%, transparent)', color: 'var(--destructive)' }
  if (diffDays === 0) return { bg: 'color-mix(in srgb, var(--primary) 14%, transparent)',     color: 'var(--primary)' }
  if (diffDays === 1) return { bg: 'color-mix(in srgb, #f97316 12%, transparent)',             color: '#f97316' }
  return { bg: 'color-mix(in srgb, var(--chart-2) 10%, transparent)',               color: 'var(--chart-2)' }
}

const CATEGORY_ICON: Record<string, string> = {
  Work:         '💼',
  Personal:     '👤',
  Projects:     '🚀',
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

// ── Sub-components ──────────────────────────────────────────────────────────

function UpcomingTaskRow({
  task,
  now,
  onEdit,
}: {
  task: Task
  now: Date
  onEdit: (t: Task) => void
}) {
  const toggleComplete = useToggleComplete()
  const relDay    = task.dueDate ? getRelativeDay(new Date(task.dueDate), now) : null
  const badgeStyle = task.dueDate ? getDayBadgeStyle(new Date(task.dueDate), now) : null
  const categoryIcon = task.category ? (CATEGORY_ICON[task.category] ?? '📋') : '📋'

  return (
    <div
      className="group flex items-start gap-2.5 rounded-xl p-2.5 transition-all duration-150 hover:bg-muted/60"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Toggle */}
      <button
        onClick={() => toggleComplete.mutate(task.id)}
        disabled={toggleComplete.isPending}
        title={task.completed ? 'Click to mark as incomplete' : 'Click to mark as complete'}
        className="mt-0.5 shrink-0 transition-opacity hover:opacity-70"
      >
        {toggleComplete.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
        ) : task.completed ? (
          <CheckCircle2 className="h-4 w-4" style={{ color: '#22c55e' }} />
        ) : (
          <Circle className="h-4 w-4" style={{ color: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)' }} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug"
          style={{
            color: task.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {/* Category chip */}
          {task.category && (
            <span
              className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <span>{categoryIcon}</span>
              {task.category}
            </span>
          )}
          {/* Relative day badge */}
          {relDay && badgeStyle && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
            >
              {relDay}
            </span>
          )}
        </div>
      </div>

      {/* Edit on hover */}
      <button
        onClick={() => onEdit(task)}
        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--muted-foreground)' }}
        title="Edit task"
      >
        <Flag className="h-3 w-3" />
      </button>
    </div>
  )
}

function MonthTaskRow({
  task,
  now,
  onEdit,
}: {
  task: Task
  now: Date
  onEdit: (t: Task) => void
}) {
  const toggleComplete = useToggleComplete()
  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < now

  return (
    <div
      className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-150"
      style={{
        backgroundColor: task.completed
          ? 'color-mix(in srgb, #22c55e 6%, transparent)'
          : isOverdue
            ? 'color-mix(in srgb, var(--destructive) 5%, transparent)'
            : 'transparent',
      }}
    >
      <button
        onClick={() => toggleComplete.mutate(task.id)}
        disabled={toggleComplete.isPending}
        title={task.completed ? 'Click to mark as incomplete' : 'Click to mark as complete'}
        className="shrink-0 transition-opacity hover:opacity-70"
      >
        {task.completed ? (
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22c55e' }} />
        ) : (
          <Circle
            className="h-3.5 w-3.5"
            style={{ color: isOverdue ? 'var(--destructive)' : (PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)') }}
          />
        )}
      </button>

      <span
        className="flex-1 truncate text-xs font-medium"
        style={{
          color: task.completed
            ? 'var(--muted-foreground)'
            : isOverdue
              ? 'var(--destructive)'
              : 'var(--foreground)',
          textDecoration: task.completed ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>

      {task.dueDate && (
        <span className="shrink-0 text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}

      <button
        onClick={() => onEdit(task)}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--muted-foreground)' }}
        title="Edit task"
      >
        <Flag className="h-3 w-3" />
      </button>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

interface CalendarRightPanelProps {
  /** Tasks due in the next 14 days (upcoming) */
  upcomingTasks: Task[]
  /** All tasks in the current month */
  monthTasks:    Task[]
}

export function CalendarRightPanel({ upcomingTasks, monthTasks }: CalendarRightPanelProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const now = new Date()

  const completedMonth = monthTasks.filter((t) => t.completed)
  const activeMonth    = monthTasks.filter((t) => !t.completed)

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* ── Upcoming Tasks ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
            >
              <Clock className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Upcoming Tasks
            </h3>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {upcomingTasks.length}
            </span>
          </div>

          {/* List */}
          <div className="p-2">
            {upcomingTasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xl mb-1">🏖️</p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  No upcoming tasks
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  All clear for the next 7 days!
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {upcomingTasks.map((task) => (
                  <UpcomingTaskRow
                    key={task.id}
                    task={task}
                    now={now}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── This Month's Tasks ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'color-mix(in srgb, var(--chart-2) 12%, transparent)' }}
            >
              <CalendarDays className="h-3.5 w-3.5" style={{ color: 'var(--chart-2)' }} />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              This Month
            </h3>
            <div className="ml-auto flex items-center gap-1.5">
              <span
                className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, #22c55e 12%, transparent)',
                  color: '#16a34a',
                }}
              >
                ✓ {completedMonth.length}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                ⚡ {activeMonth.length}
              </span>
            </div>
          </div>

          {/* In Progress */}
          {activeMonth.length > 0 && (
            <div className="px-2 pt-3 pb-2">
              <p
                className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted-foreground)' }}
              >
                In Progress
              </p>
              <div className="space-y-0.5">
                {activeMonth.map((task) => (
                  <MonthTaskRow key={task.id} task={task} now={now} onEdit={setEditingTask} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedMonth.length > 0 && (
            <div
              className={`px-2 pb-3 ${activeMonth.length > 0 ? 'border-t pt-3' : 'pt-3'}`}
              style={{ borderColor: 'var(--border)' }}
            >
              <p
                className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Completed
              </p>
              <div className="space-y-0.5">
                {completedMonth.map((task) => (
                  <MonthTaskRow key={task.id} task={task} now={now} onEdit={setEditingTask} />
                ))}
              </div>
            </div>
          )}

          {/* Empty */}
          {monthTasks.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xl mb-1">📅</p>
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                No tasks this month
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Edit dialog */}
      {editingTask && (
        <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  )
}
