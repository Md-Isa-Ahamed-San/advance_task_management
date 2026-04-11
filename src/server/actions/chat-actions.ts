'use server'

import { revalidateTag } from 'next/cache'
import { db } from '~/server/db'
import { getSession } from '~/server/better-auth/server'

// ── Helpers ─────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

// ── Actions ─────────────────────────────────────────────────────────────────

/**
 * Invite a user to a personal 1-on-1 chat by email.
 */
export async function inviteToChat(email: string) {
  const session = await requireAuth()
  const receiverEmail = email.trim().toLowerCase()

  if (receiverEmail === session.user.email.toLowerCase()) {
    throw new Error('You cannot invite yourself')
  }

  // Check if they are already in a conversation
  const existingConversation = await db.directConversation.findFirst({
    where: {
      participants: {
        every: {
          email: { in: [session.user.email, receiverEmail] }
        }
      }
    }
  })
  if (existingConversation) throw new Error('Conversation already exists')

  // Check if an invite already exists
  const existingInvite = await db.directInvitation.findUnique({
    where: {
      senderId_receiverEmail: {
        senderId: session.user.id,
        receiverEmail: receiverEmail
      }
    }
  })
  if (existingInvite?.status === 'PENDING') {
    throw new Error('Invitation already pending')
  }

  await db.directInvitation.upsert({
    where: {
      senderId_receiverEmail: {
        senderId: session.user.id,
        receiverEmail: receiverEmail
      }
    },
    update: { status: 'PENDING' },
    create: {
      senderId: session.user.id,
      receiverEmail: receiverEmail,
      status: 'PENDING'
    }
  })

  revalidateTag('chat-invites')
  return { success: true }
}

/**
 * Get pending personal chat invitations for the current user.
 */
export async function getDirectInvitations() {
  const session = await requireAuth()
  return await db.directInvitation.findMany({
    where: {
      receiverEmail: session.user.email,
      status: 'PENDING'
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get the count of pending direct invitations for the badge.
 */
export async function getDirectInvitationCount() {
  const session = await getSession()
  if (!session) return 0
  return await db.directInvitation.count({
    where: {
      receiverEmail: session.user.email,
      status: 'PENDING'
    }
  })
}

/**
 * Accept or Reject a chat invitation.
 */
export async function respondToChatInvite(invitationId: string, accept: boolean) {
  const session = await requireAuth()

  const invitation = await db.directInvitation.findUnique({
    where: { id: invitationId },
    include: { sender: true }
  })

  if (invitation?.receiverEmail !== session.user.email) {
    throw new Error('Invitation not found or unauthorized')
  }

  if (invitation.status !== 'PENDING') throw new Error('Invitation already processed')

  if (accept) {
    // Create conversation
    await db.directConversation.create({
      data: {
        participants: {
          connect: [
            { id: session.user.id },
            { id: invitation.senderId }
          ]
        }
      }
    })

    await db.directInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' }
    })
  } else {
    await db.directInvitation.update({
      where: { id: invitationId },
      data: { status: 'REJECTED' }
    })
  }

  revalidateTag('chat-invites')
  revalidateTag('conversations')
  return { success: true }
}

/**
 * Get all active direct conversations for the user.
 */
export async function getDirectConversations() {
  const session = await requireAuth()
  return await db.directConversation.findMany({
    where: {
      participants: { some: { id: session.user.id } }
    },
    include: {
      participants: {
        select: { id: true, name: true, image: true, email: true }
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })
}

/**
 * Save a direct message to DB.
 */
export async function saveDirectMessage(conversationId: string, content: string) {
  const session = await requireAuth()
  
  const conversation = await db.directConversation.findUnique({
    where: { id: conversationId },
    include: { participants: true }
  })

  if (!conversation?.participants.some(p => p.id === session.user.id)) {
    throw new Error('Conversation not found or access denied')
  }

  const message = await db.directMessage.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content.trim()
    }
  })

  // Update conversation timestamp for sorting
  await db.directConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })

  revalidateTag('conversations')
  return { success: true, message }
}
