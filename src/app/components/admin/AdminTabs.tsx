'use client'

import { useState } from 'react'
import { Users, BarChart2, Database, Shield, Server } from 'lucide-react'
import { UsersTab }          from './tabs/UsersTab'
import { AnalyticsTab }      from './tabs/AnalyticsTab'
import { DataManagementTab } from './tabs/DataManagementTab'
import { SecurityLogsTab }   from './tabs/SecurityLogsTab'
import { SystemHealthTab }   from './tabs/SystemHealthTab'
import type { AdminStats, UserWithTaskStats, CompletionTrendDay, GlobalPriorityItem, GlobalCategoryItem } from '~/server/queries/admin'

type LogEntry = {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: Date
  user: { id: string; name: string; email: string; image: string | null }
}

type Tab = 'users' | 'analytics' | 'health' | 'data' | 'security'

interface AdminTabsProps {
  stats:        AdminStats
  users:        UserWithTaskStats[]
  trend:        CompletionTrendDay[]
  priorities:   GlobalPriorityItem[]
  categories:   GlobalCategoryItem[]
  logs:         LogEntry[]
  metrics: {
    dbSizeBytes: number
    activeSessions: number
    checkedAt: string
    ablyStats: {
      messagesThisMonth: number
      messagesToday: number
      limit: number
      remaining: number
      percentUsed: number
      cachedAt: string
    }
  }
  currentUserId: string
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'users',     label: 'Users',       icon: <Users     className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics',   icon: <BarChart2 className="h-4 w-4" /> },
  { id: 'health',    label: 'System Health', icon: <Server  className="h-4 w-4" /> },
  { id: 'data',      label: 'Data',        icon: <Database  className="h-4 w-4" /> },
  { id: 'security',  label: 'Security & Logs', icon: <Shield className="h-4 w-4" /> },
]

export function AdminTabs({
  stats,
  users,
  trend,
  priorities,
  categories,
  logs,
  metrics,
  currentUserId,
}: AdminTabsProps) {
  const [active, setActive] = useState<Tab>('users')

  return (
    <div className="space-y-5">
      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 rounded-2xl border p-1.5"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {active === 'users' && (
        <UsersTab users={users} currentUserId={currentUserId} />
      )}
      {active === 'analytics' && (
        <AnalyticsTab stats={stats} trend={trend} priorities={priorities} categories={categories} />
      )}
      {active === 'health' && (
        <SystemHealthTab
          dbSizeBytes={metrics.dbSizeBytes}
          totalUsers={stats.totalUsers}
          totalTasks={stats.totalTasks}
          totalTeams={stats.totalTeams}
          activeSessions={metrics.activeSessions}
          checkedAt={metrics.checkedAt}
          ablyStats={metrics.ablyStats}
        />
      )}
      {active === 'data' && (
        <DataManagementTab
          stats={{
            totalUsers:    stats.totalUsers,
            totalTasks:    stats.totalTasks,
            totalTeams:    stats.totalTeams,
            totalLogs:     stats.totalLogs,
            totalMessages: stats.totalMessages,
          }}
        />
      )}
      {active === 'security' && (
        <SecurityLogsTab logs={logs} />
      )}
    </div>
  )
}
