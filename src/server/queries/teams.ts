import { unstable_cache } from 'next/cache'
import { db } from '~/server/db'

/**
 * Get all teams where the user is a member.
 * Cache tag: 'teams' — invalidated on any team mutation.
 * Called from: /teams/page.tsx
 */
export const getTeams = unstable_cache(
  async (userId: string) => {
    return db.team.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
        _count: { select: { tasks: true, messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
  ['teams'],
  { tags: ['teams'], revalidate: 60 },
)

/**
 * Get a single team by ID — verifies the requesting user is a member.
 * NOT cached — called from detail views where freshness is important.
 */
export async function getTeamById(teamId: string, userId: string) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      tasks: { orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }] },
      messages: {
        take: 50,
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { tasks: true, messages: true } },
    },
  })

  if (!team) return null

  const isMember = team.members.some((m) => m.userId === userId)
  if (!isMember) return null

  return team
}

/**
 * Get latest N messages for a team.
 * NOT cached — polling route needs fresh data every request.
 */
export async function getTeamMessages(teamId: string, limit = 50) {
  return db.teamMessage.findMany({
    where: { teamId },
    take: limit,
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, image: true } } },
  })
}

/**
 * Get all members of a team.
 */
export async function getTeamMembers(teamId: string) {
  return db.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { joinedAt: 'asc' },
  })
}
