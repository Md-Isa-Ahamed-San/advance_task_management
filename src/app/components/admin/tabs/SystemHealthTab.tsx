import { CheckCircle2, Database, HardDrive, Server, Activity, Clock, Cpu, MemoryStick } from 'lucide-react'

interface SystemHealthTabProps {
  dbSizeBytes:  number
  totalUsers:   number
  totalTasks:   number
  totalTeams:   number
  activeSessions: number
  checkedAt:    string
  ablyStats: {
    messagesThisMonth: number
    messagesToday: number
    limit: number
    remaining: number
    percentUsed: number
    cachedAt: string
    status: 'ok' | 'error' | 'permission_denied'
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k    = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i    = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: ok
          ? 'color-mix(in srgb, #22c55e 12%, transparent)'
          : 'color-mix(in srgb, var(--destructive) 12%, transparent)',
        color: ok ? '#16a34a' : 'var(--destructive)',
      }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: ok ? '#22c55e' : 'var(--destructive)' }}
      />
      {label}
    </span>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  simulated?: boolean
}

function MetricCard({ icon, label, value, sub, simulated }: MetricCardProps) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}
      >
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xl font-bold tabular-nums leading-tight" style={{ color: 'var(--foreground)' }}>
              {value}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{label}</p>
            {sub && <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
          </div>
          {simulated && (
            <span
              className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: 'color-mix(in srgb, #f97316 12%, transparent)', color: '#f97316' }}
            >
              Estimated
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function SystemHealthTab({
  dbSizeBytes,
  totalUsers,
  totalTasks,
  totalTeams,
  activeSessions,
  checkedAt,
  ablyStats,
}: SystemHealthTabProps) {
  const checkedDate = new Date(checkedAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  return (
    <div className="space-y-6">

      {/* Status Banner */}
      <div
        className="flex items-center justify-between rounded-2xl border px-6 py-4"
        style={{
          borderColor: 'color-mix(in srgb, #22c55e 30%, var(--border))',
          backgroundColor: 'color-mix(in srgb, #22c55e 5%, var(--card))',
        }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6" style={{ color: '#22c55e' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>All Systems Operational</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Database connected — last checked {checkedDate}
            </p>
          </div>
        </div>
        <StatusBadge ok label="Operational" />
      </div>

      {/* Server Resources (simulated) */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Server className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Server Resources</h3>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: 'color-mix(in srgb, #f97316 12%, transparent)', color: '#f97316' }}
          >
            Estimated — Serverless Environment
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard icon={<Cpu className="h-4.5 w-4.5" />}         label="CPU Load"     value="Nominal"   sub="Serverless — per-request" simulated />
          <MetricCard icon={<MemoryStick className="h-4.5 w-4.5" />} label="Memory Usage" value="~256 MB"   sub="Next.js runtime estimate"  simulated />
          <MetricCard icon={<Activity className="h-4.5 w-4.5" />}    label="Avg Response" value="< 200 ms"  sub="Typical cold start"         simulated />
        </div>
      </div>

      {/* Database Stats (real) */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Database Statistics</h3>
          <StatusBadge ok label="Connected" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            icon={<HardDrive className="h-4.5 w-4.5" />}
            label="Storage Used"
            value={formatBytes(dbSizeBytes)}
            sub="PostgreSQL (Neon)"
          />
          <MetricCard
            icon={<span className="text-base">👥</span>}
            label="Total Users"
            value={totalUsers}
            sub="Registered accounts"
          />
          <MetricCard
            icon={<span className="text-base">📋</span>}
            label="Total Tasks"
            value={totalTasks}
            sub="Across all users"
          />
          <MetricCard
            icon={<span className="text-base">👤</span>}
            label="Total Teams"
            value={totalTeams}
            sub="Collaborative groups"
          />
        </div>
      </div>

      {/* Session Info (real) */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Active Sessions</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard
            icon={<span className="text-base">🔐</span>}
            label="Active Sessions"
            value={activeSessions}
            sub="Non-expired auth sessions"
          />
          <MetricCard
            icon={<span className="text-base">⚡</span>}
            label="Runtime"
            value="Node.js"
            sub="Serverless — Vercel Edge"
            simulated
          />
          <MetricCard
            icon={<span className="text-base">🌐</span>}
            label="Platform"
            value="Next.js 15"
            sub="App Router + Prisma"
          />
        </div>
      </div>

      {/* Ably Message Quota (real) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📡</span>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Ably Message Quota</h3>
            {ablyStats.status === 'ok' ? (
              <StatusBadge ok label="Connected" />
            ) : ablyStats.status === 'permission_denied' ? (
              <StatusBadge ok={false} label="Restricted" />
            ) : (
              <StatusBadge ok={false} label="API Error" />
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Cached: {new Date(ablyStats.cachedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (refreshes 6h)
          </span>
        </div>
        
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          {ablyStats.status === 'permission_denied' ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-orange-500">Action Not Permitted (40160)</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Your Ably API key does not have the <code className="bg-muted px-1 rounded">statistics</code> capability enabled. 
                Enable it in your Ably Dashboard to view real-time message usage metrics.
              </p>
              <a 
                href="https://ably.com/dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block mt-1 text-xs font-bold underline underline-offset-4"
                style={{ color: 'var(--primary)' }}
              >
                Go to Ably Dashboard ↗
              </a>
            </div>
          ) : ablyStats.status === 'error' ? (
            <p className="text-sm text-red-500">Failed to fetch Ably quota. Check your API key.</p>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                <span>{ablyStats.messagesThisMonth.toLocaleString()} messages used</span>
                <span className={ablyStats.percentUsed > 85 ? 'text-red-500' : ablyStats.percentUsed > 60 ? 'text-orange-500' : 'text-green-500'}>
                  {ablyStats.percentUsed}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, ablyStats.percentUsed))}%`,
                    backgroundColor: ablyStats.percentUsed > 85 ? '#ef4444' : ablyStats.percentUsed > 60 ? '#f97316' : '#22c55e',
                  }}
                />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                of {ablyStats.limit.toLocaleString()} free-tier monthly limit
              </p>

              {/* Detail Metrics */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Today</p>
                  <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                    {ablyStats.messagesToday.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Remaining</p>
                  <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                    {ablyStats.remaining.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <a
                    href="https://ably.com/accounts"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: 'var(--primary)' }}
                  >
                    Manage on Ably dashboard ↗
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
