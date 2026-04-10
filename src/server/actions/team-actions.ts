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
 * Invite a member by email — OWNER or ADMIN.
 * Creates a TeamInvitation instead of adding directly.
 */
export async function inviteMember(teamId: string, email: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER', 'ADMIN'])

  const userEmail = email.trim().toLowerCase()

  // Check if already a member
  const existingMember = await db.teamMember.findFirst({
    where: {
      teamId,
      user: { email: userEmail },
    },
  })
  if (existingMember) throw new Error('User is already a member')

  // Check if already invited (pending)
  const existingInvite = await db.teamInvitation.findUnique({
    where: { teamId_email: { teamId, email: userEmail } },
  })
  if (existingInvite?.status === 'PENDING') {
    throw new Error('Invitation already sent and pending')
  }

  // Create or upsert invitation
  await db.teamInvitation.upsert({
    where: { teamId_email: { teamId, email: userEmail } },
    update: { status: 'PENDING', role: 'MEMBER' },
    create: { teamId, email: userEmail, role: 'MEMBER' },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.member_invited', teamId, { email: userEmail })

  return { success: true }
}

/**
 * Get all pending invitations for the current user's email.
 */
export async function getPendingInvitations() {
  const session = await requireAuth()
  const invitations = await db.teamInvitation.findMany({
    where: {
      email: session.user.email,
      status: 'PENDING',
    },
    include: {
      team: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return invitations
}

/**
 * Accept or Reject an invitation.
 */
export async function respondToInvitation(invitationId: string, accept: boolean) {
  const session = await requireAuth()

  const invitation = await db.teamInvitation.findUnique({
    where: { id: invitationId },
    include: { team: true },
  })

  if (!invitation) throw new Error('Invitation not found')
  if (invitation.email !== session.user.email) throw new Error('Unauthorized')
  if (invitation.status !== 'PENDING') throw new Error('Invitation already processed')

  if (accept) {
    // Check if user already in team (safety)
    const existing = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId: invitation.teamId, userId: session.user.id } },
    })

    if (!existing) {
      await db.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: session.user.id,
          role: invitation.role,
        },
      })
    }

    await db.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' },
    })

    await logActivity(session.user.id, 'team.invitation_accepted', invitation.teamId)
  } else {
    await db.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED' },
    })
    await logActivity(session.user.id, 'team.invitation_rejected', invitation.teamId)
  }

  revalidateTag('teams')
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

/**
 * Leave a team — any member except OWNER.
 */
export async function leaveTeam(teamId: string) {
  const session = await requireAuth()
  const member = await requireTeamRole(teamId, session.user.id)

  if (member.role === 'OWNER') {
    throw new Error('Owner cannot leave the team. Transfer ownership or delete the team instead.')
  }

  await db.teamMember.delete({
    where: { teamId_userId: { teamId, userId: session.user.id } },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.left', teamId)

  return { success: true }
}

/**
 * Generate a new invite code for a team — OWNER or ADMIN only.
 */
export async function generateInviteCode(teamId: string) {
  const session = await requireAuth()
  await requireTeamRole(teamId, session.user.id, ['OWNER', 'ADMIN'])

  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  await db.team.update({
    where: { id: teamId },
    data: { inviteCode },
  })

  revalidateTag('teams')
  return { success: true, inviteCode }
}

/**
 * Join a team using an invite code.
 */
export async function joinTeamWithCode(inviteCode: string) {
  const session = await requireAuth()
  const trimmed = inviteCode.trim().toUpperCase()

  const team = await db.team.findUnique({
    where: { inviteCode: trimmed },
  })

  if (!team) throw new Error('Invalid invite code')

  const existing = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId: session.user.id } },
  })

  if (existing) throw new Error('You already belong to this team')

  await db.teamMember.create({
    data: { teamId: team.id, userId: session.user.id, role: 'MEMBER' },
  })

  revalidateTag('teams')
  await logActivity(session.user.id, 'team.joined_via_code', team.id)

  return { success: true, teamId: team.id }
}
