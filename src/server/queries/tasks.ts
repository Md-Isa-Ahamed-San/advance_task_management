 import { unstable_cache } from 'next/cache'
import { db } from '~/server/db'

// ─── Helpers ────────────────────────────────────────────────────────────────

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// ─── Query Types ─────────────────────────────────────────────────────────────

export interface GetTasksOptions {
  userId: string
  filter?: 'all' | 'active' | 'completed'
  category?: string
  search?: string
}

// ─── Queries (with caching) ───────────────────────────────────────────────────

/**
 * Get all tasks for a user with optional filtering.
 * Cache tag: 'tasks' — invalidated on any task mutation.
 */
export const getTasks = unstable_cache(
  async ({ userId, filter, category, search }: GetTasksOptions) => {
    return db.task.findMany({
      where: {
        userId,
        teamId: null,
        ...(filter === 'active' && { completed: false }),
        ...(filter === 'completed' && { completed: true }),
        ...(category && { category }),
        ...(search && {
          title: { contains: search, mode: 'insensitive' as const },
        }),
      },
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
    })
  },
  ['tasks'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get tasks due today (not completed).
 */
export const getTasksDueToday = unstable_cache(
  async (userId: string) => {
    const today = new Date()
    return db.task.findMany({
      where: {
        userId,
        teamId: null,
        completed: false,
        dueDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    })
  },
  ['tasks-due-today'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get overdue incomplete tasks (dueDate < today).
 */
export const getOverdueTasks = unstable_cache(
  async (userId: string) => {
    return db.task.findMany({
      where: {
        userId,
        teamId: null,
        completed: false,
        dueDate: { lt: startOfDay() },
      },
      orderBy: [{ dueDate: 'asc' }],
    })
  },
  ['tasks-overdue'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get all tasks for a given month (any completion status).
 * IMPORTANT: cache key includes userId + year + month to avoid serving wrong month.
 */
export const getTasksByMonth = unstable_cache(
  async (userId: string, year: number, month: number) => {
    // Use UTC boundaries to avoid timezone shifting
    const firstDay = new Date(Date.UTC(year, month - 1, 1))
    const lastDay  = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

    return db.task.findMany({
      where: {
        OR: [
          { userId, teamId: null },
          { team: { members: { some: { userId } } } }
        ],
        dueDate: { gte: firstDay, lte: lastDay },
      },
      orderBy: [{ dueDate: 'asc' }],
    })
  },
  // ✅ Include year + month in the cache key so each month caches separately
  ['tasks-by-month'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get a single task by ID — verifies ownership.
 * Not cached — used in actions where freshness is critical.
 */
export async function getTaskById(id: string, userId: string) {
  return db.task.findUnique({
    where: { id, userId },
  })
}

/**
 * Get quick stats for home view.
 */
export const getTaskSummary = unstable_cache(
  async (userId: string) => {
    const [total, completed, overdue] = await Promise.all([
      db.task.count({ where: { userId, teamId: null } }),
      db.task.count({ where: { userId, teamId: null, completed: true } }),
      db.task.count({
        where: { userId, teamId: null, completed: false, dueDate: { lt: startOfDay() } },
      }),
    ])

    return {
      total,
      completed,
      active: total - completed,
      overdue,
    }
  },
  ['task-summary'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get upcoming tasks (due in the next 7 days, not yet completed).
 */
export const getUpcomingTasks = unstable_cache(
  async (userId: string) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    return db.task.findMany({
      where: {
        userId,
        teamId: null,
        completed: false,
        dueDate: { gt: endOfDay(today), lte: endOfDay(nextWeek) },
      },
      orderBy: [{ dueDate: 'asc' }],
      take: 10,
    })
  },
  ['tasks-upcoming'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get tasks for the Calendar right panel:
 * - Overdue (not completed, past due) — shown as overdue
 * - Due today
 * - Due in the next 14 days
 * Sorted by dueDate ascending (soonest first).
 */
export const getCalendarUpcomingTasks = unstable_cache(
  async (userId: string) => {
    const in14Days = new Date()
    in14Days.setDate(in14Days.getDate() + 14)
    return db.task.findMany({
      where: {
        OR: [
          { userId, teamId: null },
          { team: { members: { some: { userId } } } }
        ],
        completed: false,
        dueDate: { lte: endOfDay(in14Days) },
      },
      orderBy: [{ dueDate: 'asc' }],
      take: 20,
    })
  },
  ['tasks-calendar-upcoming'],
  { tags: ['tasks'], revalidate: 60 },
)


/**
 * Get tasks due this week (next 7 days including today, not completed).
 */
export const getThisWeekTasks = unstable_cache(
  async (userId: string) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    return db.task.findMany({
      where: {
        userId,
        teamId: null,
        completed: false,
        dueDate: { gte: startOfDay(today), lte: endOfDay(nextWeek) },
      },
      orderBy: [{ dueDate: 'asc' }],
    })
  },
  ['tasks-this-week'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get high priority incomplete tasks.
 */
export const getHighPriorityTasks = unstable_cache(
  async (userId: string) => {
    return db.task.findMany({
      where: { userId, teamId: null, completed: false, priority: 'HIGH' },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 10,
    })
  },
  ['tasks-high-priority'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get the most recently created tasks.
 */
export const getRecentTasks = unstable_cache(
  async (userId: string) => {
    return db.task.findMany({
      where: { userId, teamId: null },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
    })
  },
  ['tasks-recent'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get task counts broken down by priority (for progress section).
 */
export const getPriorityTaskCounts = unstable_cache(
  async (userId: string) => {
    const [highTotal, highDone, medTotal, medDone, lowTotal, lowDone] = await Promise.all([
      db.task.count({ where: { userId, teamId: null, priority: 'HIGH' } }),
      db.task.count({ where: { userId, teamId: null, priority: 'HIGH', completed: true } }),
      db.task.count({ where: { userId, teamId: null, priority: 'MEDIUM' } }),
      db.task.count({ where: { userId, teamId: null, priority: 'MEDIUM', completed: true } }),
      db.task.count({ where: { userId, teamId: null, priority: 'LOW' } }),
      db.task.count({ where: { userId, teamId: null, priority: 'LOW', completed: true } }),
    ])
    return {
      high:   { total: highTotal, completed: highDone, rate: highTotal > 0 ? Math.round((highDone / highTotal) * 100) : 0 },
      medium: { total: medTotal,  completed: medDone,  rate: medTotal  > 0 ? Math.round((medDone  / medTotal)  * 100) : 0 },
      low:    { total: lowTotal,  completed: lowDone,  rate: lowTotal  > 0 ? Math.round((lowDone  / lowTotal)  * 100) : 0 },
    }
  },
  ['priority-counts'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Get tasks for a specific team.
 */
export const getTeamTasks = unstable_cache(
  async (teamId: string, filter?: 'all' | 'active' | 'completed', search?: string) => {
    return db.task.findMany({
      where: {
        teamId,
        ...(filter === 'active' && { completed: false }),
        ...(filter === 'completed' && { completed: true }),
        ...(search && {
          title: { contains: search, mode: 'insensitive' as const },
        }),
      },
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })
  },
  ['team-tasks'],
  { tags: ['tasks'], revalidate: 60 }
)
