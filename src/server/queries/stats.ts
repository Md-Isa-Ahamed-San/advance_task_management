import { unstable_cache } from 'next/cache'
import { db } from '~/server/db'

// ─── Date Helpers ─────────────────────────────────────────────────────────────

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

// ─── Cached Queries ───────────────────────────────────────────────────────────

/**
 * Extended task stats with completion rate.
 * Cache tag: 'tasks' — invalidated on any task mutation.
 */
export const getTaskStats = unstable_cache(
  async (userId: string) => {
    const [total, completed, overdue] = await Promise.all([
      db.task.count({ where: { userId } }),
      db.task.count({ where: { userId, completed: true } }),
      db.task.count({
        where: { userId, completed: false, dueDate: { lt: startOfDay() } },
      }),
    ])

    return {
      total,
      completed,
      active: total - completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  },
  ['task-stats'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Task count by priority for bar chart.
 */
export const getPriorityDistribution = unstable_cache(
  async (userId: string) => {
    const groups = await db.task.groupBy({
      by: ['priority'],
      where: { userId },
      _count: true,
    })

    const map = new Map(groups.map((g) => [g.priority, g._count]))
    return [
      { priority: 'HIGH', label: 'High', count: map.get('HIGH') ?? 0 },
      { priority: 'MEDIUM', label: 'Medium', count: map.get('MEDIUM') ?? 0 },
      { priority: 'LOW', label: 'Low', count: map.get('LOW') ?? 0 },
    ]
  },
  ['priority-distribution'],
  { tags: ['tasks'], revalidate: 60 },
)

/**
 * Tasks created vs completed per day for the past 7 days.
 */
export const getWeeklyTrend = unstable_cache(
  async (userId: string) => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return Promise.all(
      days.map(async (date) => {
        const [created, completed] = await Promise.all([
          db.task.count({
            where: {
              userId,
              createdAt: { gte: startOfDay(date), lte: endOfDay(date) },
            },
          }),
          db.task.count({
            where: {
              userId,
              completed: true,
              updatedAt: { gte: startOfDay(date), lte: endOfDay(date) },
            },
          }),
        ])
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
          created,
          completed,
        }
      }),
    )
  },
  ['weekly-trend'],
  { tags: ['tasks'], revalidate: 300 }, // 5 min — trend data doesn't need to be instant
)

/**
 * Task breakdown by category with completion rate.
 */
export const getCategoryBreakdown = unstable_cache(
  async (userId: string) => {
    const [groups, completedGroups] = await Promise.all([
      db.task.groupBy({ by: ['category'], where: { userId }, _count: true }),
      db.task.groupBy({ by: ['category'], where: { userId, completed: true }, _count: true }),
    ])

    const completedMap = new Map(completedGroups.map((g) => [g.category, g._count]))

    return groups
      .filter((g) => g.category !== null)
      .map((g) => {
        const total = g._count
        const completed = completedMap.get(g.category) ?? 0
        return {
          category: g.category ?? 'Uncategorized',
          total,
          completed,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      })
      .sort((a, b) => b.total - a.total)
  },
  ['category-breakdown'],
  { tags: ['tasks'], revalidate: 60 },
)
