import { Bell, CheckCircle2, Archive } from 'lucide-react'
import { getSession } from '~/server/better-auth/server'
import { getOverdueTasks, getTasks } from '~/server/queries/tasks'
import { InboxTaskRow } from '@/app/components/inbox/InboxTaskRow'
import { AddTaskButton } from '@/app/components/tasks/TaskForm'

export const metadata = {
  title: 'Notifications — TaskFlow',
}

export default async function NotificationsPage() {
  const session = await getSession()
  const userId = session!.user.id

  const [overdueTasks, activeTasks] = await Promise.all([
    getOverdueTasks(userId),
    getTasks({ userId, filter: 'active' }),
  ])

  const overdueIds = new Set(overdueTasks.map((t) => t.id))
  const uncategorized = activeTasks.filter((t) => !t.category && !overdueIds.has(t.id))
  const restActive = activeTasks.filter((t) => t.category && !overdueIds.has(t.id))

  const totalUnread = overdueTasks.length + uncategorized.length

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
          >
            <Bell className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Notifications
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {totalUnread > 0
                ? `${totalUnread} item${totalUnread !== 1 ? 's' : ''} need attention`
                : 'All clear!'}
            </p>
          </div>
        </div>
        <AddTaskButton />
      </div>

      {/* ── Overdue section ── */}
      {overdueTasks.length > 0 && (
        <section className="space-y-2">
          <h2
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--destructive)' }}
          >
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}
            >
              {overdueTasks.length}
            </span>
            Overdue
          </h2>
          <ul className="space-y-2">
            {overdueTasks.map((task) => (
              <InboxTaskRow key={task.id} task={task} variant="overdue" />
            ))}
          </ul>
        </section>
      )}

      {/* ── Uncategorized section ── */}
      {uncategorized.length > 0 && (
        <section className="space-y-2">
          <h2
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {uncategorized.length}
            </span>
            Uncategorized
          </h2>
          <ul className="space-y-2">
            {uncategorized.map((task) => (
              <InboxTaskRow key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {/* ── Active section ── */}
      {restActive.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Active ({restActive.length})
          </h2>
          <ul className="space-y-2">
            {restActive.map((task) => (
              <InboxTaskRow key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      {/* ── Zero state ── */}
      {overdueTasks.length === 0 && activeTasks.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border py-16 text-center"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)' }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--chart-2)' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              All caught up! 🎉
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No pending tasks requiring attention.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <Archive className="h-3.5 w-3.5" />
            Completed tasks are archived
          </div>
        </div>
      )}
    </div>
  )
}
