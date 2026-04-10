'use client'

import { useState } from 'react'
import type { Task } from '../../../../generated/prisma'
import { useToggleComplete } from '~/hooks/use-toggle-complete'
import { useDeleteTask } from '~/hooks/use-delete-task'
import { TaskForm } from '../tasks/TaskForm'
import { Trash2, Edit2 } from 'lucide-react'
import { Badge } from '../ui/badge'

interface InboxTaskRowProps {
  task: Task
  variant?: 'overdue' | 'normal'
}

function formatDueDate(date: Date): string {
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'var(--destructive)',
  MEDIUM: '#f97316',
  LOW: 'var(--chart-2)',
}

export function InboxTaskRow({ task, variant = 'normal' }: InboxTaskRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const toggleComplete = useToggleComplete()
  const deleteTask = useDeleteTask()

  const isOverdue = variant === 'overdue'

  return (
    <>
      <li
        className="group flex items-start gap-3 rounded-xl border p-4 transition-colors"
        style={{
          borderColor: isOverdue ? 'color-mix(in srgb, var(--destructive) 40%, transparent)' : 'var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        {/* Complete checkbox */}
        <button
          className="mt-0.5 shrink-0"
          onClick={() => toggleComplete.mutate(task.id)}
          disabled={toggleComplete.isPending}
          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
            style={{
              borderColor: task.completed ? 'var(--primary)' : isOverdue ? 'var(--destructive)' : 'var(--border)',
              backgroundColor: task.completed ? 'var(--primary)' : 'transparent',
            }}
          >
            {task.completed && (
              <svg className="h-3 w-3" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: PRIORITY_DOT[task.priority] ?? 'var(--muted)' }}
            />
            <p
              className="flex-1 text-sm font-medium leading-snug"
              style={{
                color: 'var(--foreground)',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </p>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-4">
            {task.category && (
              <Badge variant="secondary" className="text-xs">{task.category}</Badge>
            )}
            {task.dueDate && (
              <span
                className="text-xs font-medium"
                style={{ color: isOverdue ? 'var(--destructive)' : 'var(--muted-foreground)' }}
              >
                {formatDueDate(new Date(task.dueDate))}
              </span>
            )}
            {task.description && (
              <span className="truncate text-xs max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
                {task.description}
              </span>
            )}
          </div>
        </div>

        {/* Row actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded p-1.5 hover:opacity-70"
            title="Edit"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            disabled={deleteTask.isPending}
            className="rounded p-1.5 hover:opacity-70"
            title="Delete"
            style={{ color: 'var(--destructive)' }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </li>

      {editOpen && <TaskForm task={task} onClose={() => setEditOpen(false)} />}
    </>
  )
}
