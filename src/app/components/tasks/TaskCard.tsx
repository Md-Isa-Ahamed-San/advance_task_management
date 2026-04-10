import { CheckCircle2, Circle } from 'lucide-react'
import type { Task } from '../../../../generated/prisma'
import { Badge } from '../ui/badge'

interface TaskCardProps {
  task: Task
  compact?: boolean
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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date()

  return (
    <div
      className="group flex items-start gap-3 rounded-xl border p-3 transition-all duration-150 hover:shadow-sm"
      style={{
        borderColor: task.completed
          ? 'color-mix(in srgb, #22c55e 25%, var(--border))'
          : isOverdue
            ? 'color-mix(in srgb, var(--destructive) 40%, var(--border))'
            : 'var(--border)',
        backgroundColor: task.completed
          ? 'color-mix(in srgb, #22c55e 4%, var(--card))'
          : isOverdue
            ? 'color-mix(in srgb, var(--destructive) 3%, var(--card))'
            : 'var(--card)',
      }}
    >
      {/* Completed icon OR priority dot */}
      {task.completed ? (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: '#22c55e' }}
        />
      ) : (
        <Circle
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)' }}
          strokeWidth={2.5}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug"
          style={{
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
          }}
        >
          {task.title}
        </p>
        {!compact && task.description && (
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex shrink-0 items-center gap-2">
        {task.completed ? (
          <Badge
            className="text-[11px] border-0 font-medium"
            style={{
              backgroundColor: 'color-mix(in srgb, #22c55e 14%, transparent)',
              color: '#16a34a',
            }}
          >
            ✓ Done
          </Badge>
        ) : (
          <>
            {!compact && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority] ?? 'var(--muted)'} 14%, transparent)`,
                  color: PRIORITY_COLOR[task.priority] ?? 'var(--muted-foreground)',
                }}
              >
                {PRIORITY_LABEL[task.priority] ?? task.priority}
              </span>
            )}
            {task.category && (
              <Badge variant="secondary" className="text-[11px]">
                {task.category}
              </Badge>
            )}
            {task.dueDate && (
              <span
                className="text-[11px] font-medium tabular-nums"
                style={{
                  color: isOverdue ? 'var(--destructive)' : 'var(--muted-foreground)',
                }}
              >
                {formatDate(new Date(task.dueDate))}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
