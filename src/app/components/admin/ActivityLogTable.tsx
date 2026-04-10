import { Clock, User, Database } from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: Date
  user: { id: string; name: string; email: string }
}

interface ActivityLogTableProps {
  logs: ActivityLog[]
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function actionColor(action: string): string {
  if (action.includes('deleted')) return 'var(--destructive)'
  if (action.includes('created')) return 'var(--chart-2)'
  return 'var(--muted-foreground)'
}

function actionLabel(action: string): string {
  return action.replace(/_/g, ' ').replace(/\./g, ' › ')
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  if (logs.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <Clock className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          No activity recorded yet
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-4 px-5 py-3"
          >
            {/* Icon */}
            <div
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              {log.entityType === 'User' ? (
                <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              ) : (
                <Database className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium capitalize" style={{ color: actionColor(log.action) }}>
                {actionLabel(log.action)}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                by {log.user.name} ({log.user.email})
              </p>
            </div>

            {/* Time */}
            <span className="shrink-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {relativeTime(log.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
