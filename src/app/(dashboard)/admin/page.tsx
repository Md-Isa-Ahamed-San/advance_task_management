import { redirect }   from 'next/navigation'
import { getSession }  from '~/server/better-auth/server'
import { db }          from '~/server/db'
import { Shield }      from 'lucide-react'
import {
  getAdminStats,
  getAllUsersWithStats,
  getTaskCompletionTrend,
  getGlobalPriorityDistribution,
  getGlobalCategoryBreakdown,
  getActivityLogs,
  getDbSizeBytes,
} from '~/server/queries/admin'
import { getAblyStats } from '~/server/queries/ably-stats'
import { SystemStatsBar } from '@/app/components/admin/SystemStatsBar'
import { AdminTabs }      from '@/app/components/admin/AdminTabs'

export const metadata = {
  title: 'Admin — TaskFlow',
}

// Disable caching for the admin page — always fresh
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getSession()

  // Server-side role guard
  const me = await db.user.findUnique({
    where: { id: session!.user.id },
    select: { role: true },
  })
  if (me?.role !== 'admin') {
    redirect('/home')
  }

  // Parallel data fetch
  const [stats, users, trend, priorities, categories, logs, dbSizeBytes, ablyStats] =
    await Promise.all([
      getAdminStats(),
      getAllUsersWithStats(),
      getTaskCompletionTrend(),
      getGlobalPriorityDistribution(),
      getGlobalCategoryBreakdown(),
      getActivityLogs(60),
      getDbSizeBytes(),
      getAblyStats(),
    ])

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Admin Panel
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              System management · {users.length} users · {stats.totalTasks} tasks
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium"
          style={{ borderColor: 'color-mix(in srgb, #22c55e 30%, var(--border))', color: '#16a34a', backgroundColor: 'color-mix(in srgb, #22c55e 6%, var(--card))' }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          All Systems Operational
        </div>
      </div>

      {/* ── Hero Stats ── */}
      <SystemStatsBar
        totalUsers={stats.totalUsers}
        activeUsers={stats.activeUsers}
        totalTasks={stats.totalTasks}
        completedTasks={stats.completedTasks}
        completionRate={stats.completionRate}
      />

      {/* ── Tabbed Content ── */}
      <AdminTabs
        stats={stats}
        users={users}
        trend={trend}
        priorities={priorities}
        categories={categories}
        logs={logs}
        metrics={{
          dbSizeBytes,
          activeSessions: stats.activeSessions,
          checkedAt: new Date().toISOString(),
          ablyStats,
        }}
        currentUserId={session!.user.id}
      />

    </div>
  )
}
