'use client'

import { useState } from 'react'
import { Shield, Clock, Activity, Search } from 'lucide-react'

interface LogEntry {
  id:         string
  action:     string
  entityType: string
  entityId:   string
  createdAt:  Date
  user: {
    id:    string
    name:  string
    email: string
    image: string | null
  }
}

interface SecurityLogsTabProps {
  logs: LogEntry[]
}

const ACTION_ICON: Record<string, string> = {
  'admin.user_deleted':    '🗑️',
  'admin.role_changed':    '🔑',
  'admin.clear_all_tasks': '🧹',
  'admin.system_reset':    '⚠️',
  'task.created':          '➕',
  'task.updated':          '✏️',
  'task.deleted':          '🗑️',
  'task.completed':        '✅',
  'user.login':            '🔐',
  'user.logout':           '🚪',
}

const ACTION_COLOR: Record<string, string> = {
  'admin.user_deleted':    'var(--destructive)',
  'admin.role_changed':    '#f97316',
  'admin.clear_all_tasks': 'var(--destructive)',
  'admin.system_reset':    'var(--destructive)',
}

function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

function formatAction(action: string): string {
  return action
    .replace(/\./g, ' › ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SecurityLogsTab({ logs }: SecurityLogsTabProps) {
  const [search, setSearch] = useState('')

  const filtered = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.user.name.toLowerCase().includes(search.toLowerCase()) ||
    log.user.email.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType.toLowerCase().includes(search.toLowerCase()),
  )

  // Simple threat detection: count admin destructive actions in last hour
  const oneHourAgo     = new Date(Date.now() - 60 * 60 * 1000)
  const recentAdminOps = logs.filter(
    (l) => l.action.startsWith('admin.') && new Date(l.createdAt) > oneHourAgo,
  ).length
  const threatLevel = recentAdminOps >= 3 ? 'elevated' : 'low'

  return (
    <div className="space-y-5">

      {/* Security Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Threat status */}
        <div
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{
            borderColor: threatLevel === 'elevated'
              ? 'color-mix(in srgb, var(--destructive) 35%, var(--border))'
              : 'color-mix(in srgb, #22c55e 30%, var(--border))',
            backgroundColor: 'var(--card)',
          }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: threatLevel === 'elevated'
                ? 'color-mix(in srgb, var(--destructive) 12%, transparent)'
                : 'color-mix(in srgb, #22c55e 12%, transparent)',
            }}
          >
            <Shield className="h-4 w-4" style={{ color: threatLevel === 'elevated' ? 'var(--destructive)' : '#22c55e' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Threat Detection</p>
            <p
              className="text-xs font-medium"
              style={{ color: threatLevel === 'elevated' ? 'var(--destructive)' : '#16a34a' }}
            >
              {threatLevel === 'elevated' ? '⚠ Elevated Activity' : '✓ No Threats Detected'}
            </p>
          </div>
        </div>

        {/* Total logs */}
        <div
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
          >
            <Activity className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{logs.length}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Events Logged</p>
          </div>
        </div>

        {/* Last event */}
        <div
          className="rounded-2xl border p-4 flex items-center gap-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--chart-2) 12%, transparent)' }}
          >
            <Clock className="h-4 w-4" style={{ color: 'var(--chart-2)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Last Event</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {logs[0]
                ? new Date(logs[0].createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit',
                  })
                : 'No events yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Log table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Activity Log</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {filtered.length} of {logs.length} events
            </p>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter logs…"
              className="w-full rounded-xl border py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No logs found</p>
        ) : (
          <div className="divide-y max-h-[520px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((log) => {
              const icon  = ACTION_ICON[log.action] ?? '📌'
              const color = ACTION_COLOR[log.action] ?? 'var(--muted-foreground)'
              const isAdmin = log.action.startsWith('admin.')

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                  style={{
                    backgroundColor: isAdmin
                      ? 'color-mix(in srgb, var(--destructive) 3%, transparent)'
                      : 'transparent',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                  >
                    {icon}
                  </div>

                  {/* Event */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-medium"
                        style={{ color: isAdmin ? 'var(--destructive)' : 'var(--foreground)' }}
                      >
                        {formatAction(log.action)}
                      </span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                      >
                        {log.entityType}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {log.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={log.user.image} alt="" className="h-4 w-4 rounded-full" />
                      ) : (
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          style={{ backgroundColor: 'var(--primary)' }}
                        >
                          {getInitials(log.user.name)}
                        </span>
                      )}
                      <span>{log.user.name}</span>
                      <span>·</span>
                      <span>{log.user.email}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="shrink-0 text-[11px] tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
