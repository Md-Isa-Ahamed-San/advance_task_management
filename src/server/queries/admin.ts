import { db } from '~/server/db'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTasks: number
  completedTasks: number
  activeTasks: number
  overdueTasks: number
  highPriorityTasks: number
  tasksWithDueDates: number
  tasksDueToday: number
  tasksDueThisWeek: number
  avgTasksPerUser: number
  completionRate: number
  totalTeams: number
  totalMessages: number
  totalLogs: number
  activeSessions: number
}

export interface UserWithTaskStats {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  createdAt: Date
  taskCount: number
  completedCount: number
  activeCount: number
  overdueCount: number
  teamCount: number
}

export interface CompletionTrendDay {
  date: string        // 'Apr 01'
  completed: number
  created: number
}

export interface GlobalPriorityItem {
  priority: string
  label: string
  count: number
}

export interface GlobalCategoryItem {
  category: string
  total: number
  completed: number
  rate: number
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get all users with per-user task breakdowns.
 */
export async function getAllUsersWithStats(): Promise<UserWithTaskStats[]> {
  const now = new Date()

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      tasks: {
        select: {
          completed: true,
          dueDate: true,
        },
      },
      _count: { select: { teamMembers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((u) => {
    const taskCount     = u.tasks.length
    const completedCount = u.tasks.filter((t) => t.completed).length
    const activeCount   = u.tasks.filter((t) => !t.completed).length
    const overdueCount  = u.tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now,
    ).length

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      image: u.image,
      createdAt: u.createdAt,
      taskCount,
      completedCount,
      activeCount,
      overdueCount,
      teamCount: u._count.teamMembers,
    }
  })
}

/**
 * Get comprehensive admin stats.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const now     = new Date()
  const today   = new Date(now); today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const weekEnd  = new Date(now); weekEnd.setDate(now.getDate() + 7); weekEnd.setHours(23, 59, 59, 999)

  const [
    totalUsers,
    totalTasks,
    completedTasks,
    overdueTasks,
    highPriorityTasks,
    tasksWithDueDates,
    tasksDueToday,
    tasksDueThisWeek,
    totalTeams,
    totalMessages,
    totalLogs,
    activeSessions,
    usersWithTasks,
  ] = await Promise.all([
    db.user.count(),
    db.task.count(),
    db.task.count({ where: { completed: true } }),
    db.task.count({ where: { completed: false, dueDate: { lt: now } } }),
    db.task.count({ where: { priority: 'HIGH', completed: false } }),
    db.task.count({ where: { dueDate: { not: null } } }),
    db.task.count({ where: { completed: false, dueDate: { gte: today, lte: todayEnd } } }),
    db.task.count({ where: { completed: false, dueDate: { gte: today, lte: weekEnd } } }),
    db.team.count(),
    db.teamMessage.count(),
    db.activityLog.count(),
    db.session.count({ where: { expiresAt: { gt: now } } }),
    db.user.count({ where: { tasks: { some: {} } } }),
  ])

  return {
    totalUsers,
    activeUsers: usersWithTasks,
    totalTasks,
    completedTasks,
    activeTasks: totalTasks - completedTasks,
    overdueTasks,
    highPriorityTasks,
    tasksWithDueDates,
    tasksDueToday,
    tasksDueThisWeek,
    avgTasksPerUser: totalUsers > 0 ? Math.round((totalTasks / totalUsers) * 10) / 10 : 0,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalTeams,
    totalMessages,
    totalLogs,
    activeSessions,
  }
}

/**
 * Task completion trend — last 14 days (created vs completed per day).
 */
export async function getTaskCompletionTrend(): Promise<CompletionTrendDay[]> {
  const days: CompletionTrendDay[] = []

  for (let i = 13; i >= 0; i--) {
    const d    = new Date()
    d.setDate(d.getDate() - i)
    const start = new Date(d); start.setHours(0, 0, 0, 0)
    const end   = new Date(d); end.setHours(23, 59, 59, 999)

    const [completed, created] = await Promise.all([
      db.task.count({ where: { completed: true, updatedAt: { gte: start, lte: end } } }),
      db.task.count({ where: { createdAt: { gte: start, lte: end } } }),
    ])

    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed,
      created,
    })
  }
  return days
}

/**
 * Priority distribution across all tasks (global).
 */
export async function getGlobalPriorityDistribution(): Promise<GlobalPriorityItem[]> {
  const [high, medium, low] = await Promise.all([
    db.task.count({ where: { priority: 'HIGH' } }),
    db.task.count({ where: { priority: 'MEDIUM' } }),
    db.task.count({ where: { priority: 'LOW' } }),
  ])
  return [
    { priority: 'HIGH',   label: 'High',   count: high },
    { priority: 'MEDIUM', label: 'Medium', count: medium },
    { priority: 'LOW',    label: 'Low',    count: low },
  ]
}

/**
 * Category breakdown across all tasks (global) — top 6.
 */
export async function getGlobalCategoryBreakdown(): Promise<GlobalCategoryItem[]> {
  const tasks = await db.task.findMany({
    where: { category: { not: null } },
    select: { category: true, completed: true },
  })

  const map = new Map<string, { total: number; completed: number }>()
  for (const t of tasks) {
    const key = t.category!
    const cur = map.get(key) ?? { total: 0, completed: 0 }
    map.set(key, {
      total:     cur.total + 1,
      completed: cur.completed + (t.completed ? 1 : 0),
    })
  }

  return [...map.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([category, { total, completed }]) => ({
      category,
      total,
      completed,
      rate: Math.round((completed / total) * 100),
    }))
}

/**
 * Get activity logs with user info.
 */
export async function getActivityLogs(limit = 60) {
  return db.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })
}

/**
 * System stats (for DB health section).
 */
export async function getSystemStats() {
  const now = new Date()
  const [totalUsers, totalTasks, completedTasks, totalTeams] = await Promise.all([
    db.user.count(),
    db.task.count(),
    db.task.count({ where: { completed: true } }),
    db.team.count(),
  ])
  return {
    totalUsers,
    totalTasks,
    completedTasks,
    totalTeams,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    checkedAt: now.toISOString(),
  }
}

/**
 * Get DB size via raw SQL (Neon / PostgreSQL).
 */
export async function getDbSizeBytes(): Promise<number> {
  try {
    const result = await db.$queryRaw<[{ size: bigint }]>`
      SELECT pg_database_size(current_database()) AS size
    `
    return Number(result[0]?.size ?? 0)
  } catch {
    return 0
  }
}
