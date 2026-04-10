'use client'

import { Check, X, Bell } from 'lucide-react'
import { usePendingInvitations, useRespondToInvitation } from '~/hooks/use-invitations'

export function InvitationList() {
  const { data: invitations, isLoading } = usePendingInvitations()
  const respond = useRespondToInvitation()

  if (isLoading || !invitations || invitations.length === 0) return null

  return (
    <div className="border-b px-3 py-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)' }}>
      <div className="flex items-center gap-2 px-1">
        <Bell className="h-4 w-4" style={{ color: 'var(--primary)' }} />
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
          Pending Invites ({invitations.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {invitations.map((invite) => (
          <div 
            key={invite.id} 
            className="flex flex-col gap-2 rounded-xl border p-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {invite.team.name}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                You were invited to join this team as a {invite.role.toLowerCase()}.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => respond.mutate({ invitationId: invite.id, accept: true })}
                disabled={respond.isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Check className="h-3 w-3" />
                Accept
              </button>
              <button
                onClick={() => respond.mutate({ invitationId: invite.id, accept: false })}
                disabled={respond.isPending}
                className="flex items-center justify-center rounded-lg border p-1.5 transition-colors hover:bg-muted disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--destructive)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
