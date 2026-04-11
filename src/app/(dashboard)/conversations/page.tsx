import { redirect } from 'next/navigation'
import { getSession } from '~/server/better-auth/server'
import { getDirectConversations, getDirectInvitations } from '~/server/actions/chat-actions'
import { ConversationsClient } from './ConversationsClient'


export const metadata = {
  title: 'Conversations — TaskFlow',
}

export default async function ConversationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [conversations, invitations] = await Promise.all([
    getDirectConversations(),
    getDirectInvitations()
  ])

  // Map conversations to ensure proper names/images for the OTHER participant
  const formattedConversations = conversations.map(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== session.user.id)
    return {
      ...conv,
      otherParticipant: otherParticipant ?? { id: 'deleted', name: 'Deleted User', image: null, email: '' }
    }
  })

  return (
    <ConversationsClient 
      initialConversations={formattedConversations}
      initialInvitations={invitations}
      currentUserId={session.user.id}
    />
  )
}
