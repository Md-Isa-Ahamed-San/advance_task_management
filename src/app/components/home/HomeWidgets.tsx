import Link from 'next/link'
import { Calendar, Flag, Clock } from 'lucide-react'
import type { Task } from '../../../../generated/prisma'

interface HomeWidgetsProps {
  thisWeekTasks:    Task[]
  highPriorityTasks: Task[]
  recentTasks:      Task[]
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PRIORITY_DOT: Record<string, string> = {
  HIGH:   'var(--destructive)',
  MEDIUM: '#f97316',
  LOW:    'var(--chart-2)',
}

function MiniTaskRow({ task }: { task: Task }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
      style={{
        backgroundColor: task.completed
          ? 'color-mix(in srgb, #22c55e 6%, var(--muted))'
          : 'var(--muted)',
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: task.completed ? '#22c55e' : (PRIORITY_DOT[task.priority] ?? 'var(--muted-foreground)'),
        }}
      />
      <span
        className="flex-1 truncate text-xs font-medium"
        style={{
          color: task.completed ? 'var(--muted-foreground)' : 'var(--foreground)',
          textDecoration: task.completed ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>
      {task.dueDate && (
        <span className="shrink-0 text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
          {formatDate(new Date(task.dueDate))}
        </span>
      )}
    </div>
  )
}

interface WidgetCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  count: number
  tasks: Task[]
  viewAllHref: string
  emptyText: string
}

function WidgetCard({ icon, iconBg, title, count, tasks, viewAllHref, emptyText }: WidgetCardProps) {
  return (
    <div
      className="rounded-2xl border flex flex-col overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            {count}
          </span>
          <Link
            href={viewAllHref}
            className="text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 p-3 space-y-1.5">
        {tasks.length === 0 ? (
          <p className="py-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {emptyText}
          </p>
        ) : (
          tasks.slice(0, 5).map((task) => <MiniTaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}

export function HomeWidgets({ thisWeekTasks, highPriorityTasks, recentTasks }: HomeWidgetsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <WidgetCard
        icon={<Calendar className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />}
        iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
        title="This Week"
        count={thisWeekTasks.length}
        tasks={thisWeekTasks}
        viewAllHref="/tasks?filter=active"
        emptyText="Nothing due this week 🎉"
      />
      <WidgetCard
        icon={<Flag className="h-3.5 w-3.5" style={{ color: 'var(--destructive)' }} />}
        iconBg="color-mix(in srgb, var(--destructive) 12%, transparent)"
        title="High Priority"
        count={highPriorityTasks.length}
        tasks={highPriorityTasks}
        viewAllHref="/tasks?filter=active"
        emptyText="No urgent tasks right now ✅"
      />
      <WidgetCard
        icon={<Clock className="h-3.5 w-3.5" style={{ color: '#f97316' }} />}
        iconBg="color-mix(in srgb, #f97316 12%, transparent)"
        title="Recently Added"
        count={recentTasks.length}
        tasks={recentTasks}
        viewAllHref="/tasks"
        emptyText="No tasks yet — create one!"
      />
    </div>
  )
}
