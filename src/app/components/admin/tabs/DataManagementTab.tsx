'use client'

import { useState, useTransition } from 'react'
import { Download, Trash2, RefreshCw, AlertTriangle, Database, Users, CheckSquare, BarChart2 } from 'lucide-react'
import { exportSystemData, clearAllTasks, resetSystem } from '~/server/actions/admin-actions'
import { toast } from 'sonner'

interface DataStats {
  totalUsers:  number
  totalTasks:  number
  totalTeams:  number
  totalLogs:   number
  totalMessages: number
}

interface DataManagementTabProps {
  stats: DataStats
}

function ConfirmAction({
  label,
  description,
  confirmText,
  icon,
  danger,
  onConfirm,
  isPending,
}: {
  label:       string
  description: string
  confirmText: string
  icon:        React.ReactNode
  danger?:     boolean
  onConfirm:   () => void
  isPending:   boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{
        borderColor: danger ? 'color-mix(in srgb, var(--destructive) 35%, var(--border))' : 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: danger
              ? 'color-mix(in srgb, var(--destructive) 12%, transparent)'
              : 'color-mix(in srgb, var(--primary) 12%, transparent)',
          }}
        >
          <span style={{ color: danger ? 'var(--destructive)' : 'var(--primary)' }}>{icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          disabled={isPending}
          className="w-full rounded-xl py-2 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: danger ? 'var(--destructive)' : 'color-mix(in srgb, var(--primary) 12%, transparent)',
            color: danger ? 'white' : 'var(--primary)',
          }}
        >
          {label}
        </button>
      ) : (
        <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: 'color-mix(in srgb, var(--destructive) 40%, var(--border))' }}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--destructive)' }}>
            <AlertTriangle className="h-4 w-4" />
            {confirmText}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setOpen(false); onConfirm() }}
              disabled={isPending}
              className="flex-1 rounded-xl py-1.5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--destructive)', color: 'white' }}
            >
              {isPending ? 'Processing…' : 'Yes, proceed'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border py-1.5 text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DataManagementTab({ stats }: DataManagementTabProps) {
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    startTransition(async () => {
      try {
        const data = await exportSystemData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Data exported successfully')
      } catch {
        toast.error('Export failed')
      }
    })
  }

  function handleClearTasks() {
    startTransition(async () => {
      try {
        await clearAllTasks()
        toast.success('All tasks cleared')
      } catch {
        toast.error('Failed to clear tasks')
      }
    })
  }

  function handleReset() {
    startTransition(async () => {
      try {
        await resetSystem()
        toast.success('System reset complete')
      } catch {
        toast.error('Reset failed')
      }
    })
  }

  const DATA_ITEMS = [
    { icon: <Users className="h-4 w-4" />,      label: 'Users',            value: stats.totalUsers },
    { icon: <CheckSquare className="h-4 w-4" />, label: 'Tasks',            value: stats.totalTasks },
    { icon: <Users className="h-4 w-4" />,       label: 'Teams',            value: stats.totalTeams },
    { icon: <BarChart2 className="h-4 w-4" />,   label: 'Activity Logs',    value: stats.totalLogs },
    { icon: <Database className="h-4 w-4" />,    label: 'Messages',         value: stats.totalMessages },
  ]

  return (
    <div className="space-y-6">

      {/* Data Summary */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Data Summary</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Current records in the database</p>
        </div>
        <div className="grid grid-cols-5 divide-x" style={{ borderColor: 'var(--border)' }}>
          {DATA_ITEMS.map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center py-5 gap-1">
              <div style={{ color: 'var(--muted-foreground)' }}>{item.icon}</div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{item.value}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div
        className="rounded-2xl border p-5 flex items-start gap-4"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
        >
          <Download className="h-4 w-4" style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Export All Data</p>
          <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--muted-foreground)' }}>
            Download users, tasks, and teams as a JSON backup file.
          </p>
          <button
            onClick={handleExport}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
          >
            <Download className="h-4 w-4" />
            {isPending ? 'Exporting…' : 'Export JSON'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" style={{ color: 'var(--destructive)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>Danger Zone</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ConfirmAction
            label="Clear All Tasks"
            description="Permanently deletes every task across all users. This cannot be undone."
            confirmText="This will delete all tasks permanently."
            icon={<Trash2 className="h-4 w-4" />}
            danger
            onConfirm={handleClearTasks}
            isPending={isPending}
          />
          <ConfirmAction
            label="Reset System"
            description="Deletes tasks, teams, messages, and logs. Users are preserved."
            confirmText="This will reset all system data. Irreversible."
            icon={<RefreshCw className="h-4 w-4" />}
            danger
            onConfirm={handleReset}
            isPending={isPending}
          />
        </div>
      </div>

    </div>
  )
}
