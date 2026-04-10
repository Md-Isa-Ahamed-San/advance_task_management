'use client'

import { useState } from 'react'
import type { Task } from '../../../../generated/prisma'
import { useToggleComplete } from '~/hooks/use-toggle-complete'
import { TaskForm } from '../tasks/TaskForm'
import { Edit2, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'

interface CalendarDayPanelProps {
  tasks: Task[]
  day:   number
  month: number
  year:  number
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

const PRIORITY_LABEL: Record<string, string> = {
  HIGH:   'High',
  MEDIUM: 'Med',
  LOW:    'Low',
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function CalendarDayPanel({ tasks, day, month, year }: CalendarDayPanelProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const toggleComplete = useToggleComplete()

  const label = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const now = new Date()
  const isPastDay = new Date(year, month - 1, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const completed = tasks.filter((t) => t.completed).length
  const overdue   = tasks.filter((t) => !t.completed && isPastDay).length

  return (
    <>
      {/* Header */}
      <div
        className="border-b px-4 py-3.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          {label}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span style={{ color: 'var(--muted-foreground)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          {completed > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, #22c55e 12%, transparent)',
                color: '#16a34a',
              }}
            >
              ✓ {completed} done
            </span>
          )}
          {overdue > 0 && (
            <span
              className="rounded-full px-1.5 py-0.5 font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                color: 'var(--destructive)',
              }}
            >
              ⚠ {overdue} overdue
            </span>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="p-3 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              No tasks on this day
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Tasks with a due date on this day will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => {
              const isTaskOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < now
              return (
                <li
                  key={task.id}
                  className="group flex items-start gap-2.5 rounded-xl border p-3 transition-all duration-150"
                  style={{
                    borderColor: task.completed
                      ? 'color-mix(in srgb, #22c55e 25%, var(--border))'
                      : isTaskOverdue
                        ? 'color-mix(in srgb, var(--destructive) 35%, var(--border))'
                        : 'var(--border)',
                    backgroundColor: task.completed
                      ? 'color-mix(in srgb, #22c55e 5%, var(--muted))'
                      : isTaskOverdue
                        ? 'color-mix(in srgb, var(--destructive) 4%, var(--muted))'
                        : 'var(--muted)',
                  }}
                >
                  {/* Complete toggle — works both ways */}
                  <button
                    onClick={() => toggleComplete.mutate(task.id)}
                    disabled={toggleComplete.isPending}
                    title={task.completed ? 'Click to mark as incomplete' : 'Click to mark as complete'}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    className="mt-0.5 shrink-0 transition-opacity hover:opacity-70"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4" style={{ color: '#22c55e' }} />
                    ) : (
                      <Circle
                        className="h-4 w-4"
                        style={{ color: isTaskOverdue ? 'var(--destructive)' : (PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)') }}
                      />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="text-sm font-medium leading-snug"
                        style={{
                          color: task.completed
                            ? 'var(--muted-foreground)'
                            : isTaskOverdue
                              ? 'var(--destructive)'
                              : 'var(--foreground)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>

                      {/* Edit button */}
                      <button
                        onClick={() => setEditingTask(task)}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 rounded p-0.5 hover:opacity-70"
                        style={{ color: 'var(--muted-foreground)' }}
                        title="Edit task"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Meta row */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {isTaskOverdue && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-medium"
                          style={{ color: 'var(--destructive)' }}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                      {task.category && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: 'var(--border)',
                            color: 'var(--muted-foreground)',
                          }}
                        >
                          {task.category}
                        </span>
                      )}
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority] ?? 'var(--muted)'} 12%, transparent)`,
                          color: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)',
                        }}
                      >
                        {PRIORITY_LABEL[task.priority] ?? task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                          {formatTime(new Date(task.dueDate))}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p
                        className="mt-1 line-clamp-2 text-[11px]"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {editingTask && (
        <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  )
}
