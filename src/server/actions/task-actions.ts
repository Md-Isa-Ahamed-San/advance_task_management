'use server'

import { revalidateTag } from 'next/cache'
import { db } from '~/server/db'
import { getSession } from '~/server/better-auth/server'
import type { Priority } from '../../../generated/prisma'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

async function requireTaskAccess(taskId: string, userId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error('Task not found')

  if (task.teamId) {
    // If it's a team task, verify user is a member of that team
    const member = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId: task.teamId, userId } },
    })
    if (!member) throw new Error('Forbidden: Not a member of this team')
  } else {
    // If it's a personal task, strictly enforce owner
    if (task.userId !== userId) throw new Error('Forbidden: Not task owner')
  }

  return task
}

function revalidateTaskPaths() {
  revalidateTag('tasks')
}

async function logActivity(
  userId: string,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  await db.activityLog.create({
    data: {
      action,
      entityType: 'Task',
      entityId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: JSON.parse(JSON.stringify(metadata ?? {})),
      userId,
    },
  })
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string
  description?: string
  category?: string
  priority?: Priority
  dueDate?: string // ISO string from client
  teamId?: string
}

/**
 * Create a new task for the authenticated user.
 */
export async function createTask(data: CreateTaskInput) {
  const session = await requireAuth()

  if (data.teamId) {
    // Verify user is in the team
    const member = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId: data.teamId, userId: session.user.id } },
    })
    if (!member) throw new Error('Cannot create tasks in a team you do not belong to')
  }

  const task = await db.task.create({
    data: {
      title: data.title,
      description: data.description ?? '',
      category: data.teamId ? 'Work' : data.category,
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: session.user.id,
      ...(data.teamId && { teamId: data.teamId }),
    },
  })

  revalidateTaskPaths()
  await logActivity(session.user.id, 'task.created', task.id, { title: task.title })

  return { success: true, task }
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  category?: string
  priority?: Priority
  dueDate?: string | null
  completed?: boolean
}

/**
 * Update a task — verifies ownership before modifying.
 */
export async function updateTask(id: string, data: UpdateTaskInput) {
  const session = await requireAuth()
  await requireTaskAccess(id, session.user.id)

  const task = await db.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.completed !== undefined && { completed: data.completed }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
  })

  revalidateTaskPaths()
  await logActivity(session.user.id, 'task.updated', task.id, { title: task.title })

  return { success: true, task }
}

/**
 * Delete a task — verifies ownership.
 */
export async function deleteTask(id: string) {
  const session = await requireAuth()
  await requireTaskAccess(id, session.user.id)

  await db.task.delete({ where: { id } })

  revalidateTaskPaths()
  await logActivity(session.user.id, 'task.deleted', id)

  return { success: true }
}

/**
 * Toggle the completed status of a task.
 */
export async function toggleComplete(id: string) {
  const session = await requireAuth()
  const task = await requireTaskAccess(id, session.user.id)

  const updated = await db.task.update({
    where: { id },
    data: { completed: !task.completed },
  })

  revalidateTaskPaths()
  await logActivity(session.user.id, 'task.toggled', id, {
    completed: updated.completed,
  })

  return { success: true, task: updated }
}

/**
 * Bulk delete multiple tasks — filters to only owned tasks, safe to call with any IDs.
 */
export async function bulkDeleteTasks(ids: string[]) {
  const session = await requireAuth()

  let deletedCount = 0
  for (const id of ids) {
    try {
      await requireTaskAccess(id, session.user.id)
      await db.task.delete({ where: { id } })
      deletedCount++
    } catch {
      // Skip unauthorized or missing tasks
    }
  }

  revalidateTaskPaths()
  await logActivity(session.user.id, 'task.bulk_deleted', 'multiple', { count: deletedCount, ids })

  return { success: true, count: deletedCount }
}

/**
 * Fetch tasks for a specific team (Server Action for Client Components)
 */
export async function getTeamTasksAction(teamId: string, filter?: 'all' | 'active' | 'completed', search?: string) {
  const session = await requireAuth()
  // Verify membership
  const member = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  })
  if (!member) throw new Error('Unauthorized')

  const tasks = await db.task.findMany({
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

  return { success: true, tasks }
}

/**
 * Fetch task summary for a specific team (Server Action for Client Components)
 */
export async function getTeamTaskSummaryAction(teamId: string) {
  const session = await requireAuth()
  // Verify membership
  const member = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  })
  if (!member) throw new Error('Unauthorized')

  const startOfDay = (date = new Date()) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const [total, completed, overdue] = await Promise.all([
    db.task.count({ where: { teamId } }),
    db.task.count({ where: { teamId, completed: true } }),
    db.task.count({
      where: { teamId, completed: false, dueDate: { lt: startOfDay() } },
    }),
  ])

  return {
    success: true,
    summary: {
      total,
      completed,
      active: total - completed,
      overdue,
    },
  }
}

