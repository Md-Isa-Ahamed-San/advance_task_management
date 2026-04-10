'use client'

import { useState, useEffect } from 'react'
import type { Task } from '../../../../generated/prisma'
import type { Priority } from '../../../../generated/prisma'
import { useCreateTask } from '~/hooks/use-create-task'
import { useUpdateTask } from '~/hooks/use-update-task'
import { Plus, X, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface TaskFormProps {
  task?: Task              // undefined = create mode
  teamId?: string          // If provided, this is a team task
  onClose: () => void
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'HIGH',   label: '🔴 High',   color: '#ef4444' },
  { value: 'MEDIUM', label: '🟠 Medium', color: '#f97316' },
  { value: 'LOW',    label: '🟢 Low',    color: '#10b981' },
]

const CATEGORIES = ['Personal', 'Projects', 'Work']

export function TaskForm({ task, teamId, onClose }: TaskFormProps) {
  const isEdit = !!task
  // Effective teamId: use prop if provided, or task's teamId if editing
  const effectiveTeamId = teamId ?? task?.teamId ?? undefined

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [form, setForm] = useState({
    title:       task?.title       ?? '',
    description: task?.description ?? '',
    category:    task?.category    ?? '',
    priority:    task?.priority    ?? 'MEDIUM',
    dueDate:     task?.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]!
      : '',
  })
  const [error, setError] = useState('')

  const isPending = createTask.isPending || updateTask.isPending

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }

    const data = {
      title:       form.title.trim(),
      description: form.description.trim() || undefined,
      category:    effectiveTeamId ? 'Work' : (form.category || undefined),
      priority:    form.priority,
      dueDate:     form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      teamId:      effectiveTeamId,
    }

    if (isEdit) {
      updateTask.mutate({ id: task.id, data }, { onSuccess: onClose })
    } else {
      createTask.mutate(data, { onSuccess: onClose })
    }
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === form.priority)

  return (
    /* Backdrop with blur */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Dialog */}
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            >
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:opacity-70"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm"
              style={{
                borderColor: 'color-mix(in srgb, var(--destructive) 40%, var(--border))',
                backgroundColor: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                color: 'var(--destructive)',
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Title *
            </Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="What needs to be done?"
              disabled={isPending}
              autoFocus
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Description
            </Label>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Add details…"
              rows={3}
              disabled={isPending}
              className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor:     'var(--border)',
                backgroundColor: 'var(--input)',
                color:           'var(--foreground)',
              }}
            />
          </div>

          {/* Priority pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Priority
            </Label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                  disabled={isPending}
                  className="flex-1 rounded-xl border py-2 text-xs font-semibold transition-all duration-150"
                  style={{
                    borderColor:     form.priority === p.value ? p.color : 'var(--border)',
                    backgroundColor: form.priority === p.value
                      ? `color-mix(in srgb, ${p.color} 12%, transparent)`
                      : 'var(--card)',
                    color: form.priority === p.value ? p.color : 'var(--muted-foreground)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {selectedPriority && (
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                Selected: <span style={{ color: selectedPriority.color }}>{selectedPriority.label}</span>
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="task-category" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Category
            </Label>
            <div className="flex gap-2 flex-wrap">
              {effectiveTeamId ? (
                <div
                  className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                  style={{
                    borderColor:     'var(--primary)',
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color:           'var(--primary)',
                  }}
                >
                  Work (Team Task)
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: '' }))}
                    disabled={isPending}
                    className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150"
                    style={{
                      borderColor:     !form.category ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: !form.category ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--card)',
                      color:           !form.category ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                  >
                    None
                  </button>
                  {CATEGORIES.filter(c => c !== 'Work').map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: c }))}
                      disabled={isPending}
                      className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150"
                      style={{
                        borderColor:     form.category === c ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: form.category === c ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--card)',
                        color:           form.category === c ? 'var(--primary)' : 'var(--muted-foreground)',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="task-due" className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Due Date
            </Label>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              disabled={isPending}
              className="rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl mt-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl mt-3"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'var(--primary-foreground)',
              }}
            >
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Standalone Add Task Button ───────────────────────────────────────────────
export function AddTaskButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-md"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'var(--primary-foreground)',
        }}
      >
        <Plus className="h-4 w-4" />
        New Task
      </button>
      {open && <TaskForm onClose={() => setOpen(false)} />}
    </>
  )
}
