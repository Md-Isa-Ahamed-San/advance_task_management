'use server'

import { revalidateTag } from 'next/cache'
import { db } from '~/server/db'
import { getSession } from '~/server/better-auth/server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'admin') throw new Error('Forbidden: Admin access required')

  return session
}

async function logActivity(
  userId: string,
  action: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  await db.activityLog.create({
    data: {
      action,
      entityType: 'User',
      entityId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: JSON.parse(JSON.stringify(metadata ?? {})),
      userId,
    },
  })
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Delete a user and all their data (cascade).
 * Admin only. Cannot delete yourself.
 */
export async function deleteUser(targetUserId: string) {
  const session = await requireAdmin()

  if (targetUserId === session.user.id) {
    throw new Error('Cannot delete your own account')
  }

  const target = await db.user.findUnique({ where: { id: targetUserId } })
  if (!target) throw new Error('User not found')

  await db.user.delete({ where: { id: targetUserId } })

  revalidateTag('admin')
  await logActivity(session.user.id, 'admin.user_deleted', targetUserId, {
    email: target.email,
    name: target.name,
  })

  return { success: true }
}

/**
 * Update a user's role.
 * Admin only. Cannot change your own role.
 */
export async function updateUserRole(targetUserId: string, role: 'user' | 'admin') {
  const session = await requireAdmin()

  if (targetUserId === session.user.id) {
    throw new Error('Cannot change your own role')
  }

  await db.user.update({
    where: { id: targetUserId },
    data: { role },
  })

  revalidateTag('admin')
  await logActivity(session.user.id, 'admin.role_changed', targetUserId, { role })

  return { success: true }
}

/**
 * Export all system data as a serializable JSON object.
 */
export async function exportSystemData() {
  await requireAdmin()

  const [users, tasks, teams] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.task.findMany({
      select: {
        id: true, title: true, description: true, category: true,
        priority: true, completed: true, dueDate: true, createdAt: true, userId: true,
      },
    }),
    db.team.findMany({
      select: { id: true, name: true, createdAt: true, createdById: true },
    }),
  ])

  return { exportedAt: new Date().toISOString(), users, tasks, teams }
}

/**
 * Delete ALL tasks across all users.
 */
export async function clearAllTasks() {
  const session = await requireAdmin()
  await db.task.deleteMany({})
  revalidateTag('tasks')
  revalidateTag('admin')
  await logActivity(session.user.id, 'admin.clear_all_tasks', 'system', {})
  return { success: true, message: 'All tasks deleted' }
}

/**
 * Full system reset — removes tasks, teams, team messages, activity logs.
 * Users are kept. Irreversible.
 */
export async function resetSystem() {
  const session = await requireAdmin()
  await db.$transaction([
    db.activityLog.deleteMany({}),
    db.teamMessage.deleteMany({}),
    db.teamMember.deleteMany({}),
    db.task.deleteMany({}),
    db.team.deleteMany({}),
  ])
  revalidateTag('tasks')
  revalidateTag('admin')
  // Re-log after reset (logs were cleared above)
  await db.activityLog.create({
    data: {
      action: 'admin.system_reset',
      entityType: 'System',
      entityId: 'system',
      metadata: { resetBy: session.user.id, at: new Date().toISOString() },
      userId: session.user.id,
    },
  })
  return { success: true, message: 'System reset complete' }
}
