'use client'

import { Crown, Shield, User, Trash2, LogOut } from 'lucide-react'
import type { MemberRole } from '../../../../generated/prisma'
import { useRemoveMember } from '~/hooks/use-remove-member'
import { useLeaveTeam } from '~/hooks/use-leave-team'

interface Member {
  role: MemberRole
  joinedAt: Date
  userId: string
  user: { id: string; name: string; email: string; image: string | null }
}

interface MemberListProps {
  members: Member[]
  currentUserId: string
  currentUserRole: MemberRole
  teamId: string
}

const ROLE_ICON: Record<MemberRole, React.ReactNode> = {
  OWNER: <Crown className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />,
  ADMIN: <Shield className="h-3.5 w-3.5" style={{ color: 'var(--chart-3)' }} />,
  MEMBER: <User className="h-3.5 w-3.5" style={{ color: 'var(--muted-foreground)' }} />,
}

export function MemberList({ members, currentUserId, currentUserRole, teamId }: MemberListProps) {
  const removeMember = useRemoveMember(teamId)
  const leaveTeam = useLeaveTeam()
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'

  return (
    <ul className="space-y-2">
      {members.map((member) => {
        const isMe = member.user.id === currentUserId
        const canRemove = canManage && !isMe && member.role !== 'OWNER'

        return (
          <li
            key={member.user.id}
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          >
            {/* Avatar */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {member.user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                  {member.user.name}
                  {isMe && (
                    <span className="ml-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      (you)
                    </span>
                  )}
                </p>
                {ROLE_ICON[member.role]}
              </div>
              <p className="truncate text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {member.user.email}
              </p>
            </div>

            {/* Role label */}
            <span className="shrink-0 text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>
              {member.role.toLowerCase()}
            </span>

            {/* Remove button — calls server action directly */}
            {canRemove && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${member.user.name} from this team?`)) {
                    removeMember.mutate(member.userId)
                  }
                }}
                disabled={removeMember.isPending}
                className="rounded p-1.5 transition-colors hover:opacity-70 disabled:opacity-40"
                title="Remove member"
                style={{ color: 'var(--destructive)' }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            {/* Leave button for self (if not owner) */}
            {isMe && member.role !== 'OWNER' && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave this team?')) {
                    leaveTeam.mutate(teamId)
                  }
                }}
                disabled={leaveTeam.isPending}
                className="rounded p-1.5 transition-colors hover:opacity-70 disabled:opacity-40"
                title="Leave team"
                style={{ color: 'var(--destructive)' }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
