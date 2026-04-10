'use server'

import { revalidateTag } from 'next/cache'
import { db } from '~/server/db'
import { getSession } from '~/server/better-auth/server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

async function requireTeamRole(
  teamId: string,
  userId: string,
  roles: ('OWNER' | 'ADMIN' | 'MEMBER')[] = ['OWNER', 'ADMIN', 'MEMBER'],
) {
  const member = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  if (!member) throw new Error('Not a team member')
  if (!roles.includes(member.role)) throw new Error('Insufficient permissions')
  return member
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
      entityType: 'Team',
      entityId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: JSON.parse(JSON.stringify(metadata ?? {})),
      userId,
    },
  })
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface CreateTeamInput {
  name: string
  description?: string
}

/**
 * Create a new team and add the creator as OWNER.
 */
export async function createTeam(data: CreateTeamInput) {
  const session = await requireAuth()

  const team = await db.team.create({
    data: {
      name: data.name.trim(),
      createdById: session.user.id,
      members: {
        create: { userId: session.user.id, role: 'OWNER' },
      },
    },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.created', team.id, { name: team.name })

  return { success: true, team }
}

/**
 * Update a team's name — OWNER only.
 */
export async function updateTeam(teamId: string, data: { name: string }) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER'])

  const team = await db.team.update({
    where: { id: teamId },
    data: { name: data.name.trim() },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.updated', team.id, { name: team.name })

  return { success: true, team }
}

/**
 * Delete a team (with cascades) — OWNER only.
 */
export async function deleteTeam(teamId: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER'])

  await db.team.delete({ where: { id: teamId } })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.deleted', teamId)

  return { success: true }
}

/**
 * Add a member by email — OWNER or ADMIN.
 */
export async function addMember(teamId: string, email: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER', 'ADMIN'])

  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new Error(`No account found for "${email}"`)

  const existing = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  })
  if (existing) throw new Error('User is already a member')

  await db.teamMember.create({
    data: { teamId, userId: user.id, role: 'MEMBER' },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.member_added', teamId, { email })

  return { success: true }
}

/**
 * Remove a member — OWNER or ADMIN (cannot remove OWNER).
 */
export async function removeMember(teamId: string, userId: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER', 'ADMIN'])

  const target = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  })
  if (!target) throw new Error('Member not found')
  if (target.role === 'OWNER') throw new Error('Cannot remove the team owner')

  await db.teamMember.delete({ where: { teamId_userId: { teamId, userId } } })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.member_removed', teamId, { userId })

  return { success: true }
}

/**
 * Send a message to a team — any member.
 */
export async function sendMessage(teamId: string, content: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id)

  if (!content.trim()) throw new Error('Message cannot be empty')

  const message = await db.teamMessage.create({
    data: {
      teamId,
      senderId: session.user.id,
      content: content.trim(),
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  })

  // No revalidatePath — TeamChat uses polling, not server-rendered
  return { success: true, message }
}

/**
 * Persist an Ably-delivered message to DB.
 * Called AFTER Ably has already delivered the message in realtime.
 * Fire-and-forget from the client — failures are logged but not thrown.
 */
export async function saveTeamMessage(teamId: string, content: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id)

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) return { success: false }

  await db.teamMessage.create({
    data: { teamId, senderId: session.user.id, content: trimmed },
  })

  revalidateTag('teams')
  return { success: true }
}
