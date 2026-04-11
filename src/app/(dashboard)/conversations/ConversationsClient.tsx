'use client'

import { useState } from 'react'
import { MessageSquare, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { respondToChatInvite, inviteToChat } from '~/server/actions/chat-actions'
import { DirectChat } from '@/app/components/chat/DirectChat'

interface Participant {
  id: string
  name: string
  image: string | null
  email: string
}

interface Conversation {
  id: string
  otherParticipant: Participant
  messages: { content: string; createdAt: Date }[]
}

interface Invitation {
  id: string
  sender: Participant
  createdAt: Date
}

interface Props {
  initialConversations: Conversation[]
  initialInvitations: Invitation[]
  currentUserId: string
}

export function ConversationsClient({ 
  initialConversations, 
  initialInvitations, 
  currentUserId,
}: Props) {
  const router = useRouter()
  const [conversations] = useState(initialConversations)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations.length > 0 ? conversations[0]!.id : null
  )
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [processingInvite, setProcessingInvite] = useState(false)

  const activeConversation = conversations.find(c => c.id === selectedId)

  const handleRespond = async (id: string, accept: boolean) => {
    try {
      await respondToChatInvite(id, accept)
      setInvitations(prev => prev.filter(inv => inv.id !== id))
      toast.success(accept ? 'Invitation accepted!' : 'Invitation declined')
      router.refresh()
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(error.message ?? 'Failed to process invitation')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setProcessingInvite(true)
    try {
      await inviteToChat(inviteEmail)
      toast.success('Invitation sent!')
      setInviteEmail('')
      setIsInviting(false)
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(error.message ?? 'Failed to send invitation')
    } finally {
      setProcessingInvite(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      
      {/* ── Sidebar ── */}
      <div 
        className="w-full md:w-80 border-r flex flex-col shrink-0" 
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Chats</h1>
          <button 
            onClick={() => setIsInviting(true)}
            className="p-2 rounded-xl transition-all hover:bg-muted"
            title="Start new conversation"
          >
            <UserPlus className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-2">
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                Pending Invites ({invitations.length})
              </p>
              {invitations.map(inv => (
                <div 
                  key={inv.id} 
                  className="p-3 rounded-2xl border flex flex-col gap-3"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 5%, var(--card))', borderColor: 'color-mix(in srgb, var(--primary) 20%, var(--border))' }}
                >
                  <div className="flex items-center gap-3">
                    {inv.sender.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inv.sender.image} alt={inv.sender.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded-full flex items-center justify-center bg-muted text-xs font-bold">
                        {inv.sender.name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{inv.sender.name}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>wants to chat</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRespond(inv.id, true)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--primary)' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRespond(inv.id, false)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:bg-muted"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Conversations */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
              Recent Messages
            </p>
            {conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquare className="h-6 w-6" style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>No active chats yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = selectedId === conv.id
                const lastMsg = conv.messages[0]
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 transition-all duration-150 group"
                    style={{
                      backgroundColor: isActive ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                    }}
                  >
                    <div className="relative shrink-0">
                      {conv.otherParticipant.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={conv.otherParticipant.image} alt={conv.otherParticipant.name} className="h-11 w-11 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="h-11 w-11 rounded-full flex items-center justify-center bg-muted text-sm font-bold shadow-sm">
                          {conv.otherParticipant.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold truncate transition-colors" style={{ color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                          {conv.otherParticipant.name}
                        </p>
                        {lastMsg && (
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate font-medium mt-0.5" style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {lastMsg?.content ?? 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Chat View ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <DirectChat 
            key={activeConversation.id}
            conversationId={activeConversation.id}
            currentUserId={currentUserId}
            otherUser={activeConversation.otherParticipant}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl flex items-center justify-center text-4xl shadow-md" style={{ backgroundColor: 'var(--card)' }}>
              👋
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Select a conversation</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Choose a friend from the list or start a new chat</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Invite Modal ── */}
      {isInviting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border shadow-2xl p-6 animate-in fade-in zoom-in duration-200" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <UserPlus className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="text-lg font-bold">New Conversation</h3>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>User Email</label>
                <input 
                  autoFocus
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsInviting(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold border transition-colors hover:bg-muted"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processingInvite || !inviteEmail.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}
                >
                  {processingInvite ? 'Sending...' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
