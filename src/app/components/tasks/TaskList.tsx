'use client'

import { useState } from 'react'
import type { Task } from '../../../../generated/prisma'
import { useToggleComplete } from '~/hooks/use-toggle-complete'
import { useDeleteTask } from '~/hooks/use-delete-task'
import { useBulkDeleteTasks } from '~/hooks/use-bulk-delete-tasks'
import { TaskCard } from './TaskCard'

import { Trash2, Edit2, CheckSquare, Square } from 'lucide-react'
import { Button } from '../ui/button'
import { TaskForm } from './TaskForm'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const toggleComplete = useToggleComplete()
  const deleteTask = useDeleteTask()
  const bulkDelete = useBulkDeleteTasks()

  const allSelected = tasks.length > 0 && selected.size === tasks.length

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(tasks.map((t) => t.id)))
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    bulkDelete.mutate([...selected], {
      onSuccess: () => setSelected(new Set()),
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
          No tasks found
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Create your first task using the button above
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className="flex items-center justify-between rounded-lg border px-4 py-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent)' }}
        >
          <span className="text-sm font-medium">
            {selected.size} task{selected.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDelete.isPending}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete selected
          </Button>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-2 px-1">
        <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          Select all
        </button>
      </div>

      {/* Task rows */}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="group flex items-start gap-2">
            {/* Select checkbox */}
            <button
              className="mt-3.5 shrink-0"
              onClick={() => toggleSelect(task.id)}
              style={{ color: selected.has(task.id) ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {selected.has(task.id) ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>

            {/* Complete checkbox — clicking toggles both ways (complete ↔ incomplete) */}
            <button
              className="group/check mt-3.5 shrink-0"
              onClick={() => toggleComplete.mutate(task.id)}
              disabled={toggleComplete.isPending}
              title={task.completed ? 'Click to mark as incomplete' : 'Click to mark as complete'}
              aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
            >
              <span
                className="relative flex h-4 w-4 items-center justify-center rounded border-2 transition-all duration-150"
                style={{
                  borderColor: task.completed ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: task.completed ? 'var(--primary)' : 'transparent',
                  // Dim slightly on hover when completed to hint it's reversible
                  opacity: undefined,
                }}
              >
                {task.completed ? (
                  // Shows undo icon on hover via CSS group trick
                  <>
                    <svg
                      className="h-2.5 w-2.5 transition-opacity group-hover/check:opacity-0"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Undo icon visible on hover */}
                    <svg
                      className="absolute h-2.5 w-2.5 opacity-0 transition-opacity group-hover/check:opacity-100"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path d="M2 5 Q2 2 5 2 Q8 2 8 5 Q8 8 5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <path d="M1 3 L2 5 L4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                ) : null}
              </span>
            </button>

            {/* Card */}
            <div className="flex-1 min-w-0">
              <TaskCard task={task} />
            </div>

            {/* Row actions (visible on hover or always on mobile) */}
            <div className="mt-2 flex shrink-0 gap-1 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
              <button
                onClick={() => setEditingTask(task)}
                className="rounded p-1.5 transition-colors hover:opacity-70"
                title="Edit task"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteTask.mutate(task.id)}
                disabled={deleteTask.isPending}
                className="rounded p-1.5 transition-colors hover:opacity-70"
                title="Delete task"
                style={{ color: 'var(--destructive)' }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit dialog */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  )
}
